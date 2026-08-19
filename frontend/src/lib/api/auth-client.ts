import { parseCurrentUser, type CurrentUser } from './auth-contract';
import { problemFromResponse } from './problem-details';

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
  const response = await fetch(`/api/v1/auth/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await problemFromResponse(response);
  }

  return parseCurrentUser(await response.json());
}

export function login(input: LoginInput): Promise<CurrentUser> {
  return submitAuth('login', input);
}

export function register(input: RegisterInput): Promise<CurrentUser> {
  return submitAuth('register', input);
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw await problemFromResponse(response);
  }
}

export async function getAuthCapabilities(): Promise<AuthCapabilities> {
  const response = await fetch('/api/v1/auth/capabilities', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw await problemFromResponse(response);
  const value: unknown = await response.json();
  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid auth capabilities response');
  }
  const record = value as Record<string, unknown>;
  const socialProviders = Array.isArray(record.socialProviders)
    ? record.socialProviders.filter(
        (provider): provider is SocialProvider =>
          provider === 'google' || provider === 'kakao' || provider === 'apple',
      )
    : [];
  return {
    passwordReset: record.passwordReset === true,
    socialProviders,
  };
}

async function submitPasswordRequest(
  path: 'forgot' | 'reset',
  input: Readonly<Record<string, string>>,
): Promise<void> {
  const response = await fetch(`/api/v1/auth/password/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await problemFromResponse(response);
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
