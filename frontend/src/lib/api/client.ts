import { problemFromResponse } from './problem-details';

function credentialedRequest(
  path: string,
  init: RequestInit | undefined,
  defaultHeaders: Record<string, string>,
): Promise<Response> {
  return fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...init?.headers,
    },
  });
}

async function requireSuccess(response: Response): Promise<Response> {
  if (!response.ok) throw await problemFromResponse(response);
  return response;
}

export async function requestJson(
  path: string,
  init?: RequestInit,
): Promise<unknown> {
  const response = await requireSuccess(
    await credentialedRequest(path, init, {
      Accept: 'application/json',
      ...(init?.body === undefined
        ? {}
        : { 'Content-Type': 'application/json' }),
    }),
  );
  return response.json() as Promise<unknown>;
}

export async function requestForm(
  path: string,
  body: FormData,
  init?: Omit<RequestInit, 'body'>,
): Promise<unknown> {
  const response = await requireSuccess(
    await credentialedRequest(
      path,
      { ...init, body },
      { Accept: 'application/json' },
    ),
  );
  return response.json() as Promise<unknown>;
}

export async function requestBlob(
  path: string,
  init?: RequestInit,
): Promise<Blob> {
  const response = await requireSuccess(
    await credentialedRequest(path, init, {}),
  );
  return response.blob();
}

export async function requestVoid(
  path: string,
  init?: RequestInit,
): Promise<void> {
  await requireSuccess(await credentialedRequest(path, init, {}));
}
