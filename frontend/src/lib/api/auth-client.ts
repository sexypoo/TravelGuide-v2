import { parseCurrentUser, type CurrentUser } from './auth-contract';
import { requestJson, requestVoid } from './client';
import { isRecord } from './runtime';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  nickname: string;
  termsAgreed: true;
}

export type SocialProvider = 'google' | 'kakao' | 'apple';

export interface AuthCapabilities {
  passwordReset: boolean;
  socialProviders: SocialProvider[];
}

async function submitAuth(
  path: 'login' | 'register',
  input: LoginInput | RegisterInput,
): Promise<CurrentUser> {
  const value = await requestJson(`/api/v1/auth/${path}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return parseCurrentUser(value);
}

export function login(input: LoginInput): Promise<CurrentUser> {
  return submitAuth('login', input);
}

export function register(input: RegisterInput): Promise<CurrentUser> {
  return submitAuth('register', input);
}

export async function logout(): Promise<void> {
  await requestVoid('/api/v1/auth/logout', {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
}

export async function getAuthCapabilities(): Promise<AuthCapabilities> {
  const value = await requestJson('/api/v1/auth/capabilities');
  if (!isRecord(value)) {
    throw new Error('Invalid auth capabilities response');
  }
  const socialProviders = Array.isArray(value.socialProviders)
    ? value.socialProviders.filter(
        (provider): provider is SocialProvider =>
          provider === 'google' || provider === 'kakao' || provider === 'apple',
      )
    : [];
  return {
    passwordReset: value.passwordReset === true,
    socialProviders,
  };
}

async function submitPasswordRequest(
  path: 'forgot' | 'reset',
  input: Readonly<Record<string, string>>,
): Promise<void> {
  await requestVoid(`/api/v1/auth/password/${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}

export function requestPasswordReset(email: string): Promise<void> {
  return submitPasswordRequest('forgot', { email });
}

export function resetPassword(token: string, password: string): Promise<void> {
  return submitPasswordRequest('reset', { token, password });
}

export function socialLoginUrl(input: {
  provider: SocialProvider;
  mode: 'login' | 'register';
  nextPath: string;
  termsAgreed: boolean;
}): string {
  const query = new URLSearchParams({
    next: input.nextPath,
    mode: input.mode,
  });
  if (input.mode === 'register' && input.termsAgreed) {
    query.set('termsAgreed', 'true');
  }
  return `/api/v1/auth/oauth/${input.provider}/start?${query.toString()}`;
}
