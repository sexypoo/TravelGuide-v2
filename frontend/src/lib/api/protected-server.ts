import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { problemFromResponse } from '@/lib/api/problem-details';
import { validateServerEnvironment } from '@/lib/env/server';

export async function fetchProtectedApi(
  path: `/api/v1/${string}`,
  nextPath: string,
): Promise<Response> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (cookieHeader.length === 0) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  const environment = validateServerEnvironment(process.env);
  const response = await fetch(`${environment.apiInternalUrl}${path}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      Cookie: cookieHeader,
    },
  });

  if (response.status === 401) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (!response.ok) {
    throw await problemFromResponse(response);
  }

  return response;
}
