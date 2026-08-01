export type NodeEnvironment = 'development' | 'test' | 'production';

export interface Environment {
  NODE_ENV: NodeEnvironment;
  DATABASE_URL: string;
  API_PORT: number;
  WEB_ORIGIN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN_SECONDS: number;
  STORAGE_DRIVER: 'local' | 's3';
  LOCAL_STORAGE_DIR: string;
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

function parseJwtExpiresIn(value: unknown): number {
  if (typeof value !== 'string') {
    throw new Error('JWT_EXPIRES_IN is required');
  }

  const match = /^(\d+)(s|m|h|d)$/.exec(value.trim());
  if (match === null) {
    throw new Error('JWT_EXPIRES_IN must use s, m, h, or d notation');
  }

  const amountText = match[1];
  const unit = match[2];
  if (amountText === undefined || unit === undefined) {
    throw new Error('JWT_EXPIRES_IN is invalid');
  }

  const amount = Number(amountText);
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };
  const seconds = amount * (multipliers[unit] ?? 0);

  if (!Number.isSafeInteger(seconds) || seconds < 60 || seconds > 30 * 86_400) {
    throw new Error('JWT_EXPIRES_IN must be between 60 seconds and 30 days');
  }

  return seconds;
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

function parseWebOrigin(value: unknown, environment: NodeEnvironment): string {
  const parsedValue = parseUrl(value, 'WEB_ORIGIN', ['http:', 'https:']);
  const url = new URL(parsedValue);
  if (
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.pathname !== '/' ||
    url.search.length > 0 ||
    url.hash.length > 0
  ) {
    throw new Error('WEB_ORIGIN must be an origin without credentials or path');
  }
  if (environment === 'production' && url.protocol !== 'https:') {
    throw new Error('Production WEB_ORIGIN must use HTTPS');
  }
  return url.origin;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Environment & Record<string, unknown> {
  const databaseUrl = readRequiredString(config, 'DATABASE_URL');
  const nodeEnvironment = parseNodeEnvironment(config.NODE_ENV);
  const jwtSecret = readRequiredString(config, 'JWT_SECRET');
  const storageDriver = config.STORAGE_DRIVER ?? 'local';

  if (storageDriver !== 'local' && storageDriver !== 's3') {
    throw new Error('STORAGE_DRIVER must be local or s3');
  }

  if (nodeEnvironment === 'production' && jwtSecret === 'change-me') {
    throw new Error('JWT_SECRET must be changed in production');
  }

  if (nodeEnvironment === 'production' && jwtSecret.length < 32) {
    throw new Error('Production JWT_SECRET must be at least 32 characters');
  }

  if (nodeEnvironment === 'production' && storageDriver !== 's3') {
    throw new Error('Production requires STORAGE_DRIVER=s3');
  }

  return {
    ...config,
    NODE_ENV: nodeEnvironment,
    DATABASE_URL: parseUrl(databaseUrl, 'DATABASE_URL', [
      'postgres:',
      'postgresql:',
    ]),
    API_PORT: parsePort(config.API_PORT),
    WEB_ORIGIN: parseWebOrigin(
      config.WEB_ORIGIN ?? 'http://localhost:3000',
      nodeEnvironment,
    ),
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN_SECONDS: parseJwtExpiresIn(config.JWT_EXPIRES_IN),
    STORAGE_DRIVER: storageDriver,
    LOCAL_STORAGE_DIR:
      typeof config.LOCAL_STORAGE_DIR === 'string' &&
      config.LOCAL_STORAGE_DIR.trim().length > 0
        ? config.LOCAL_STORAGE_DIR.trim()
        : '.data/private-uploads',
  };
}
