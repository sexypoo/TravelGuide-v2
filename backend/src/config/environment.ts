export type NodeEnvironment = 'development' | 'test' | 'production';

export interface Environment {
  NODE_ENV: NodeEnvironment;
  DATABASE_URL: string;
  API_PORT: number;
  WEB_ORIGIN: string;
}

const nodeEnvironments: readonly NodeEnvironment[] = [
  'development',
  'test',
  'production',
];

function readRequiredString(
  config: Record<string, unknown>,
  key: string,
): string {
  const value = config[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${key} is required`);
  }

  return value.trim();
}

function parseNodeEnvironment(value: unknown): NodeEnvironment {
  const environment = value ?? 'development';

  if (
    typeof environment !== 'string' ||
    !nodeEnvironments.includes(environment as NodeEnvironment)
  ) {
    throw new Error('NODE_ENV must be development, test, or production');
  }

  return environment as NodeEnvironment;
}

function parsePort(value: unknown): number {
  const port = value === undefined ? 3001 : Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('API_PORT must be an integer between 1 and 65535');
  }

  return port;
}

function parseUrl(
  value: unknown,
  key: string,
  protocols: readonly string[],
): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${key} is required`);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${key} must be a valid URL`);
  }

  if (!protocols.includes(url.protocol)) {
    throw new Error(`${key} uses an unsupported protocol`);
  }

  return value;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Environment & Record<string, unknown> {
  const databaseUrl = readRequiredString(config, 'DATABASE_URL');

  return {
    ...config,
    NODE_ENV: parseNodeEnvironment(config.NODE_ENV),
    DATABASE_URL: parseUrl(databaseUrl, 'DATABASE_URL', [
      'postgres:',
      'postgresql:',
    ]),
    API_PORT: parsePort(config.API_PORT),
    WEB_ORIGIN: parseUrl(
      config.WEB_ORIGIN ?? 'http://localhost:3000',
      'WEB_ORIGIN',
      ['http:', 'https:'],
    ),
  };
}
