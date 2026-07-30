export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseHealthResponse(value: unknown): HealthResponse {
  if (
    !isRecord(value) ||
    value.status !== 'ok' ||
    typeof value.timestamp !== 'string'
  ) {
    throw new Error('API health response is invalid');
  }

  const parsedTimestamp = new Date(value.timestamp);
  if (
    Number.isNaN(parsedTimestamp.getTime()) ||
    parsedTimestamp.toISOString() !== value.timestamp
  ) {
    throw new Error('API health timestamp is invalid');
  }

  return {
    status: value.status,
    timestamp: value.timestamp,
  };
}

export async function getLiveHealth(
  signal?: AbortSignal,
): Promise<HealthResponse> {
  const response = await fetch('/api/v1/health/live', {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`API health request failed with status ${response.status}`);
  }

  return parseHealthResponse(await response.json());
}
