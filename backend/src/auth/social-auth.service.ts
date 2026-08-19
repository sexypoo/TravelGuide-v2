import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider } from '@prisma/client';
import {
  createPublicKey,
  randomBytes,
  sign as signBytes,
  verify as verifyBytes,
} from 'node:crypto';
import { ProblemException } from '../common/http/problem.exception';
import type { Environment } from '../config/environment';
import { type AuthUserRecord, UsersService } from '../users/users.service';
import { OAuthCredentialCipher } from './oauth-credential-cipher';

const OAUTH_STATE_TTL_SECONDS = 10 * 60;

type PublicProvider = 'google' | 'kakao' | 'apple';

interface StatePayload {
  purpose: 'social-oauth';
  provider: PublicProvider;
  nextPath: string;
  nonce: string;
  mode: 'login' | 'register';
}

interface SocialProfile {
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  nickname?: string;
  refreshToken?: string;
}

interface TokenResponse {
  access_token?: unknown;
  id_token?: unknown;
  refresh_token?: unknown;
}

function socialFailure(detail: string): ProblemException {
  return new ProblemException(
    'SOCIAL_LOGIN_FAILED',
    detail,
    HttpStatus.BAD_REQUEST,
  );
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function parseProvider(value: string): PublicProvider {
  if (value === 'google' || value === 'kakao' || value === 'apple') {
    return value;
  }
  throw socialFailure('지원하지 않는 로그인 방식입니다.');
}

function prismaProvider(provider: PublicProvider): AuthProvider {
  const providers: Record<PublicProvider, AuthProvider> = {
    google: AuthProvider.GOOGLE,
    kakao: AuthProvider.KAKAO,
    apple: AuthProvider.APPLE,
  };
  return providers[provider];
}

@Injectable()
export class SocialAuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Environment, true>,
    private readonly credentialCipher: OAuthCredentialCipher,
  ) {}

  capabilities(): PublicProvider[] {
    return (['google', 'kakao', 'apple'] as const).filter((provider) =>
      this.isConfigured(provider),
    );
  }

  async authorizationUrl(
    providerValue: string,
    requestedNext: string | undefined,
    modeValue: string | undefined,
    termsAgreed: string | undefined,
  ): Promise<string> {
    const provider = parseProvider(providerValue);
    this.assertConfigured(provider);
    const nextPath = this.safeNextPath(requestedNext);
    const mode = modeValue === 'register' ? 'register' : 'login';
    if (mode === 'register' && termsAgreed !== 'true') {
      throw socialFailure('계정을 만들려면 필수 약관에 동의해 주세요.');
    }
    const nonce = randomBytes(24).toString('base64url');
    const state = await this.jwt.signAsync<StatePayload>(
      { purpose: 'social-oauth', provider, nextPath, nonce, mode },
      {
        expiresIn: OAUTH_STATE_TTL_SECONDS,
        secret: this.config.get('JWT_SECRET', { infer: true }),
      },
    );
    const callback = this.callbackUrl(provider);

    if (provider === 'google') {
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.search = new URLSearchParams({
        client_id: this.required('GOOGLE_OAUTH_CLIENT_ID'),
        redirect_uri: callback,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        nonce,
        prompt: 'select_account',
      }).toString();
      return url.toString();
    }

    if (provider === 'kakao') {
      const url = new URL('https://kauth.kakao.com/oauth/authorize');
      url.search = new URLSearchParams({
        client_id: this.required('KAKAO_OAUTH_CLIENT_ID'),
        redirect_uri: callback,
        response_type: 'code',
        scope: 'account_email,profile_nickname',
        state,
      }).toString();
      return url.toString();
    }

    const url = new URL('https://appleid.apple.com/auth/authorize');
    url.search = new URLSearchParams({
      client_id: this.required('APPLE_OAUTH_CLIENT_ID'),
      redirect_uri: callback,
      response_type: 'code',
      response_mode: 'form_post',
      scope: 'name email',
      state,
      nonce,
    }).toString();
    return url.toString();
  }

  async callback(input: {
    provider: string;
    code?: string;
    state?: string;
    error?: string;
  }): Promise<{ user: AuthUserRecord; nextPath: string }> {
    const provider = parseProvider(input.provider);
    this.assertConfigured(provider);
    if (
      input.error !== undefined ||
      input.code === undefined ||
      input.state === undefined
    ) {
      throw socialFailure('소셜 로그인이 취소되었거나 완료되지 않았습니다.');
    }
    const state = await this.verifyState(input.state, provider);
    const profile = await this.profileFor(provider, input.code, state.nonce);
    if (!profile.emailVerified) {
      throw socialFailure('이메일이 확인된 소셜 계정만 사용할 수 있습니다.');
    }
    const user = await this.users.findOrCreateSocialUser({
      provider: prismaProvider(provider),
      providerUserId: profile.providerUserId,
      email: normalizeEmail(profile.email),
      nicknameHint: profile.nickname,
      allowCreate: state.mode === 'register',
      refreshTokenCiphertext:
        profile.refreshToken === undefined
          ? undefined
          : this.credentialCipher.encrypt(profile.refreshToken),
    });
    return { user, nextPath: state.nextPath };
  }

  private async profileFor(
    provider: PublicProvider,
    code: string,
    nonce: string,
  ): Promise<SocialProfile> {
    if (provider === 'google') return this.googleProfile(code);
    if (provider === 'kakao') return this.kakaoProfile(code);
    return this.appleProfile(code, nonce);
  }

  private async googleProfile(code: string): Promise<SocialProfile> {
    const token = await this.exchangeToken(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: this.required('GOOGLE_OAUTH_CLIENT_ID'),
        client_secret: this.required('GOOGLE_OAUTH_CLIENT_SECRET'),
        redirect_uri: this.callbackUrl('google'),
        grant_type: 'authorization_code',
      }),
    );
    const accessToken = stringValue(token.access_token);
    if (accessToken === null)
      throw socialFailure('Google 인증 응답이 올바르지 않습니다.');
    const profile = objectValue(
      await this.fetchJson('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );
    const providerUserId = stringValue(profile?.sub);
    const email = stringValue(profile?.email);
    if (providerUserId === null || email === null) {
      throw socialFailure('Google 계정 정보를 확인할 수 없습니다.');
    }
    return {
      providerUserId,
      email,
      emailVerified: profile?.email_verified === true,
      nickname: stringValue(profile?.name) ?? undefined,
    };
  }

  private async kakaoProfile(code: string): Promise<SocialProfile> {
    const token = await this.exchangeToken(
      'https://kauth.kakao.com/oauth/token',
      new URLSearchParams({
        code,
        client_id: this.required('KAKAO_OAUTH_CLIENT_ID'),
        client_secret: this.required('KAKAO_OAUTH_CLIENT_SECRET'),
        redirect_uri: this.callbackUrl('kakao'),
        grant_type: 'authorization_code',
      }),
    );
    const accessToken = stringValue(token.access_token);
    if (accessToken === null)
      throw socialFailure('Kakao 인증 응답이 올바르지 않습니다.');
    const raw = objectValue(
      await this.fetchJson('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );
    const account = objectValue(raw?.kakao_account);
    const profile = objectValue(account?.profile);
    const providerUserId =
      typeof raw?.id === 'number' || typeof raw?.id === 'string'
        ? String(raw.id)
        : null;
    const email = stringValue(account?.email);
    if (providerUserId === null || email === null) {
      throw socialFailure('Kakao 계정의 이메일 제공 동의가 필요합니다.');
    }
    return {
      providerUserId,
      email,
      emailVerified:
        account?.is_email_valid === true && account.is_email_verified === true,
      nickname: stringValue(profile?.nickname) ?? undefined,
    };
  }

  private async appleProfile(
    code: string,
    nonce: string,
  ): Promise<SocialProfile> {
    const token = await this.exchangeToken(
      'https://appleid.apple.com/auth/token',
      new URLSearchParams({
        code,
        client_id: this.required('APPLE_OAUTH_CLIENT_ID'),
        client_secret: this.appleClientSecret(),
        redirect_uri: this.callbackUrl('apple'),
        grant_type: 'authorization_code',
      }),
    );
    const idToken = stringValue(token.id_token);
    const refreshToken = stringValue(token.refresh_token);
    if (idToken === null || refreshToken === null)
      throw socialFailure('Apple 인증 응답이 올바르지 않습니다.');
    const claims = await this.verifyAppleIdToken(idToken);
    const providerUserId = stringValue(claims.sub);
    const email = stringValue(claims.email);
    if (
      providerUserId === null ||
      email === null ||
      claims.nonce !== nonce ||
      (claims.email_verified !== true && claims.email_verified !== 'true')
    ) {
      throw socialFailure('Apple 계정 정보를 확인할 수 없습니다.');
    }
    return { providerUserId, email, emailVerified: true, refreshToken };
  }

  async revokeAppleRefreshToken(ciphertext: string): Promise<void> {
    this.assertConfigured('apple');
    let refreshToken: string;
    try {
      refreshToken = this.credentialCipher.decrypt(ciphertext);
    } catch {
      throw this.appleRevocationFailure();
    }

    let response: Response;
    try {
      response = await fetch('https://appleid.apple.com/auth/revoke', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams({
          client_id: this.required('APPLE_OAUTH_CLIENT_ID'),
          client_secret: this.appleClientSecret(),
          token: refreshToken,
          token_type_hint: 'refresh_token',
        }),
      });
    } catch {
      throw this.appleRevocationFailure();
    }
    if (!response.ok) throw this.appleRevocationFailure();
  }

  private async verifyState(
    token: string,
    provider: PublicProvider,
  ): Promise<StatePayload> {
    let payload: unknown;
    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get('JWT_SECRET', { infer: true }),
      });
    } catch {
      throw socialFailure('로그인 요청이 만료되었습니다. 다시 시도해 주세요.');
    }
    const value = objectValue(payload);
    if (
      value?.purpose !== 'social-oauth' ||
      value.provider !== provider ||
      typeof value.nextPath !== 'string' ||
      typeof value.nonce !== 'string' ||
      (value.mode !== 'login' && value.mode !== 'register')
    ) {
      throw socialFailure('로그인 요청을 확인할 수 없습니다.');
    }
    return {
      purpose: 'social-oauth',
      provider,
      nextPath: this.safeNextPath(value.nextPath),
      nonce: value.nonce,
      mode: value.mode,
    };
  }

  private async exchangeToken(
    url: string,
    body: URLSearchParams,
  ): Promise<TokenResponse> {
    const response = objectValue(
      await this.fetchJson(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body,
      }),
    );
    if (response === null)
      throw socialFailure('소셜 인증 서버 응답이 올바르지 않습니다.');
    return response;
  }

  private async fetchJson(url: string, init: RequestInit): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(url, init);
    } catch {
      throw socialFailure('소셜 인증 서버에 연결할 수 없습니다.');
    }
    if (!response.ok) throw socialFailure('소셜 인증을 완료하지 못했습니다.');
    try {
      return await response.json();
    } catch {
      throw socialFailure('소셜 인증 서버 응답이 올바르지 않습니다.');
    }
  }

  private appleClientSecret(): string {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({
        alg: 'ES256',
        kid: this.required('APPLE_OAUTH_KEY_ID'),
      }),
    ).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        iss: this.required('APPLE_OAUTH_TEAM_ID'),
        iat: now,
        exp: now + 5 * 60,
        aud: 'https://appleid.apple.com',
        sub: this.required('APPLE_OAUTH_CLIENT_ID'),
      }),
    ).toString('base64url');
    const content = `${header}.${payload}`;
    const signature = signBytes('sha256', Buffer.from(content), {
      key: this.required('APPLE_OAUTH_PRIVATE_KEY'),
      dsaEncoding: 'ieee-p1363',
    }).toString('base64url');
    return `${content}.${signature}`;
  }

  private async verifyAppleIdToken(
    token: string,
  ): Promise<Record<string, unknown>> {
    const parts = token.split('.');
    if (parts.length !== 3)
      throw socialFailure('Apple 인증 토큰이 올바르지 않습니다.');
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    if (
      encodedHeader === undefined ||
      encodedPayload === undefined ||
      encodedSignature === undefined
    ) {
      throw socialFailure('Apple 인증 토큰이 올바르지 않습니다.');
    }
    let header: Record<string, unknown> | null;
    let payload: Record<string, unknown> | null;
    try {
      header = objectValue(
        JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8')),
      );
      payload = objectValue(
        JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')),
      );
    } catch {
      throw socialFailure('Apple 인증 토큰이 올바르지 않습니다.');
    }
    const kid = stringValue(header?.kid);
    if (header?.alg !== 'RS256' || kid === null || payload === null) {
      throw socialFailure('Apple 인증 토큰이 올바르지 않습니다.');
    }
    const jwks = objectValue(
      await this.fetchJson('https://appleid.apple.com/auth/keys', {}),
    );
    const keys = Array.isArray(jwks?.keys) ? jwks.keys : [];
    const key = keys
      .map(objectValue)
      .find((candidate) => candidate?.kid === kid);
    if (key === undefined || key === null)
      throw socialFailure('Apple 인증 키를 확인할 수 없습니다.');
    const kty = stringValue(key.kty);
    const n = stringValue(key.n);
    const e = stringValue(key.e);
    if (kty === null || n === null || e === null) {
      throw socialFailure('Apple 인증 키를 확인할 수 없습니다.');
    }
    let publicKey: ReturnType<typeof createPublicKey>;
    try {
      publicKey = createPublicKey({ key: { kty, n, e }, format: 'jwk' });
    } catch {
      throw socialFailure('Apple 인증 키를 확인할 수 없습니다.');
    }
    const valid = verifyBytes(
      'RSA-SHA256',
      Buffer.from(`${encodedHeader}.${encodedPayload}`),
      publicKey,
      Buffer.from(encodedSignature, 'base64url'),
    );
    const audience = payload.aud;
    const expiresAt = typeof payload.exp === 'number' ? payload.exp : 0;
    if (
      !valid ||
      payload.iss !== 'https://appleid.apple.com' ||
      audience !== this.required('APPLE_OAUTH_CLIENT_ID') ||
      expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      throw socialFailure('Apple 인증 토큰 검증에 실패했습니다.');
    }
    return payload;
  }

  private callbackUrl(provider: PublicProvider): string {
    return new URL(
      `/api/v1/auth/oauth/${provider}/callback`,
      this.config.get('WEB_ORIGIN', { infer: true }),
    ).toString();
  }

  private safeNextPath(value: string | undefined): string {
    if (
      value === undefined ||
      !value.startsWith('/') ||
      value.startsWith('//')
    ) {
      return '/app';
    }
    const parsed = new URL(
      value,
      this.config.get('WEB_ORIGIN', { infer: true }),
    );
    if (
      parsed.origin !== this.config.get('WEB_ORIGIN', { infer: true }) ||
      (parsed.pathname !== '/app' && !parsed.pathname.startsWith('/app/'))
    ) {
      return '/app';
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  }

  private isConfigured(provider: PublicProvider): boolean {
    if (provider === 'google') {
      return (
        this.has('GOOGLE_OAUTH_CLIENT_ID') &&
        this.has('GOOGLE_OAUTH_CLIENT_SECRET')
      );
    }
    if (provider === 'kakao') {
      return (
        this.has('KAKAO_OAUTH_CLIENT_ID') &&
        this.has('KAKAO_OAUTH_CLIENT_SECRET')
      );
    }
    return (
      this.has('APPLE_OAUTH_CLIENT_ID') &&
      this.has('APPLE_OAUTH_TEAM_ID') &&
      this.has('APPLE_OAUTH_KEY_ID') &&
      this.has('APPLE_OAUTH_PRIVATE_KEY') &&
      this.has('OAUTH_TOKEN_ENCRYPTION_KEY')
    );
  }

  private appleRevocationFailure(): ProblemException {
    return new ProblemException(
      'ACCOUNT_DELETION_PROVIDER_FAILED',
      'Apple 계정 연결을 해제하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  private assertConfigured(provider: PublicProvider): void {
    if (!this.isConfigured(provider)) {
      throw new ProblemException(
        'SOCIAL_PROVIDER_UNAVAILABLE',
        '현재 사용할 수 없는 로그인 방식입니다.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private has(key: keyof Environment): boolean {
    return this.config.get(key, { infer: true }) !== undefined;
  }

  private required(key: keyof Environment): string {
    const value = this.config.get(key, { infer: true });
    if (typeof value !== 'string' || value.length === 0) {
      throw new ProblemException(
        'SOCIAL_PROVIDER_UNAVAILABLE',
        '현재 사용할 수 없는 로그인 방식입니다.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return value;
  }
}
