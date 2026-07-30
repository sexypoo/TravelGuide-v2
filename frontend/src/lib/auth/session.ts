import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { parseCurrentUser, type CurrentUser } from '@/lib/api/auth-contract';
import { problemFromResponse } from '@/lib/api/problem-details';
import { validateServerEnvironment } from '@/lib/env/server';

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (cookieHeader.length === 0) {
    return null;
  }

  const environment = validateServerEnvironment(process.env);
  const response = await fetch(`${environment.apiInternalUrl}/api/v1/auth/me`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      Cookie: cookieHeader,
    },
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw await problemFromResponse(response);
  }

  return parseCurrentUser(await response.json());
});

export async function requireUser(nextPath: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (user === null) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser('/admin');
  if (!user.isAdmin) {
    redirect('/app');
  }

  return user;
}
