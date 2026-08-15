import { problemFromResponse } from './problem-details';

export interface PreorderInput {
  name: string;
  email: string;
  privacyConsent: true;
}

export interface PreorderResponse {
  status: 'registered';
}

function parsePreorderResponse(value: unknown): PreorderResponse {
  if (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    value.status === 'registered'
  ) {
    return { status: 'registered' };
  }
  throw new Error('사전예약 응답 형식이 올바르지 않습니다.');
}

export async function registerPreorder(
  input: PreorderInput,
): Promise<PreorderResponse> {
  const response = await fetch('/api/v1/preorders', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await problemFromResponse(response);
  return parsePreorderResponse(await response.json());
}
