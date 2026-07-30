export interface ServerEnvironment {
  apiInternalUrl: string;
}

export function validateServerEnvironment(
  environment: NodeJS.ProcessEnv,
): ServerEnvironment {
  const value = environment.API_INTERNAL_URL;

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('API_INTERNAL_URL is required');
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('API_INTERNAL_URL must be a valid URL');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('API_INTERNAL_URL must use HTTP or HTTPS');
  }

  return {
    apiInternalUrl: url.origin,
  };
}
