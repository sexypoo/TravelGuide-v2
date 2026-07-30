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
