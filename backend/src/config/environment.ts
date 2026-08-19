export type NodeEnvironment = 'development' | 'test' | 'production';

export interface Environment {
  NODE_ENV: NodeEnvironment;
  DATABASE_URL: string;
  API_HOST: string;
  API_PORT: number;
  WEB_ORIGIN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN_SECONDS: number;
  STORAGE_DRIVER: 'local' | 's3';
  LOCAL_STORAGE_DIR: string;
  S3_REGION?: string;
  S3_BUCKET?: string;
  S3_ENDPOINT?: string;
  S3_URL_STYLE?: 'virtual' | 'path';
  S3_ACCESS_KEY_ID?: string;
  S3_SECRET_ACCESS_KEY?: string;
  GOOGLE_PLACES_API_KEY?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  GOOGLE_OAUTH_CLIENT_ID?: string;
  GOOGLE_OAUTH_CLIENT_SECRET?: string;
  KAKAO_OAUTH_CLIENT_ID?: string;
  KAKAO_OAUTH_CLIENT_SECRET?: string;
  APPLE_OAUTH_CLIENT_ID?: string;
  APPLE_OAUTH_TEAM_ID?: string;
  APPLE_OAUTH_KEY_ID?: string;
  APPLE_OAUTH_PRIVATE_KEY?: string;
  OAUTH_TOKEN_ENCRYPTION_KEY?: string;
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

function readOptionalString(
  config: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = config[key];
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${key} must be a non-empty string when provided`);
  }
  return value.trim();
}

function readFirstOptionalString(
  config: Record<string, unknown>,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = readOptionalString(config, key);
    if (value !== undefined) return value;
  }
  return undefined;
}

function requireCompleteGroup(
  values: Readonly<Record<string, string | undefined>>,
): void {
  const configured = Object.values(values).filter(
    (value) => value !== undefined,
  ).length;
  if (configured !== 0 && configured !== Object.keys(values).length) {
    throw new Error(
      `${Object.keys(values).join(', ')} must be provided together`,
    );
  }
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

function parseHost(value: unknown): string {
  const host = value ?? '0.0.0.0';
  if (
    typeof host !== 'string' ||
    !/^(?:localhost|[A-Za-z0-9.-]+|\[[0-9A-Fa-f:]+\])$/.test(host)
  ) {
    throw new Error('API_HOST must be a hostname or IP address');
  }
  return host;
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

function parseS3Endpoint(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const parsedValue = parseUrl(value, 'S3_ENDPOINT', ['http:', 'https:']);
  const url = new URL(parsedValue);
  if (
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.pathname !== '/' ||
    url.search.length > 0 ||
    url.hash.length > 0
  ) {
    throw new Error(
      'S3_ENDPOINT must be an origin without credentials or path',
    );
  }
  return url.origin;
}

function parseS3UrlStyle(
  value: string | undefined,
): 'virtual' | 'path' | undefined {
  if (value === undefined) return undefined;
  if (value !== 'virtual' && value !== 'path') {
    throw new Error('S3_URL_STYLE must be virtual or path');
  }
  return value;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Environment & Record<string, unknown> {
  const databaseUrl = readRequiredString(config, 'DATABASE_URL');
  const nodeEnvironment = parseNodeEnvironment(config.NODE_ENV);
  const jwtSecret = readRequiredString(config, 'JWT_SECRET');
  const storageDriver = config.STORAGE_DRIVER ?? 'local';
  const s3Region = readFirstOptionalString(config, [
    'S3_REGION',
    'AWS_REGION',
    'AWS_DEFAULT_REGION',
    'REGION',
  ]);
  const s3Bucket = readFirstOptionalString(config, [
    'S3_BUCKET',
    'AWS_S3_BUCKET',
    'AWS_S3_BUCKET_NAME',
    'BUCKET',
  ]);
  const s3Endpoint = readFirstOptionalString(config, [
    'S3_ENDPOINT',
    'AWS_ENDPOINT_URL',
    'ENDPOINT',
  ]);
  const s3UrlStyle = readFirstOptionalString(config, [
    'S3_URL_STYLE',
    'AWS_S3_URL_STYLE',
  ]);
  const s3AccessKeyId = readFirstOptionalString(config, [
    'S3_ACCESS_KEY_ID',
    'AWS_ACCESS_KEY_ID',
    'ACCESS_KEY_ID',
  ]);
  const s3SecretAccessKey = readFirstOptionalString(config, [
    'S3_SECRET_ACCESS_KEY',
    'AWS_SECRET_ACCESS_KEY',
    'SECRET_ACCESS_KEY',
  ]);
  const googlePlacesApiKey = readOptionalString(
    config,
    'GOOGLE_PLACES_API_KEY',
  );
  const resendApiKey = readOptionalString(config, 'RESEND_API_KEY');
  const emailFrom = readOptionalString(config, 'EMAIL_FROM');
  const googleOauthClientId = readOptionalString(
    config,
    'GOOGLE_OAUTH_CLIENT_ID',
  );
  const googleOauthClientSecret = readOptionalString(
    config,
    'GOOGLE_OAUTH_CLIENT_SECRET',
  );
  const kakaoOauthClientId = readOptionalString(
    config,
    'KAKAO_OAUTH_CLIENT_ID',
  );
  const kakaoOauthClientSecret = readOptionalString(
    config,
    'KAKAO_OAUTH_CLIENT_SECRET',
  );
  const appleOauthClientId = readOptionalString(
    config,
    'APPLE_OAUTH_CLIENT_ID',
  );
  const appleOauthTeamId = readOptionalString(config, 'APPLE_OAUTH_TEAM_ID');
  const appleOauthKeyId = readOptionalString(config, 'APPLE_OAUTH_KEY_ID');
  const appleOauthPrivateKey = readOptionalString(
    config,
    'APPLE_OAUTH_PRIVATE_KEY',
  );
  const oauthTokenEncryptionKey = readOptionalString(
    config,
    'OAUTH_TOKEN_ENCRYPTION_KEY',
  );

  requireCompleteGroup({ RESEND_API_KEY: resendApiKey, EMAIL_FROM: emailFrom });
  requireCompleteGroup({
    GOOGLE_OAUTH_CLIENT_ID: googleOauthClientId,
    GOOGLE_OAUTH_CLIENT_SECRET: googleOauthClientSecret,
  });
  requireCompleteGroup({
    KAKAO_OAUTH_CLIENT_ID: kakaoOauthClientId,
    KAKAO_OAUTH_CLIENT_SECRET: kakaoOauthClientSecret,
  });
  requireCompleteGroup({
    APPLE_OAUTH_CLIENT_ID: appleOauthClientId,
    APPLE_OAUTH_TEAM_ID: appleOauthTeamId,
    APPLE_OAUTH_KEY_ID: appleOauthKeyId,
    APPLE_OAUTH_PRIVATE_KEY: appleOauthPrivateKey,
    OAUTH_TOKEN_ENCRYPTION_KEY: oauthTokenEncryptionKey,
  });

  if (
    oauthTokenEncryptionKey !== undefined &&
    !/^[0-9a-f]{64}$/iu.test(oauthTokenEncryptionKey)
  ) {
    throw new Error(
      'OAUTH_TOKEN_ENCRYPTION_KEY must be exactly 64 hexadecimal characters',
    );
  }

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

  if (
    storageDriver === 's3' &&
    (s3Region === undefined || s3Bucket === undefined)
  ) {
    throw new Error('S3_REGION and S3_BUCKET are required for S3 storage');
  }

  if ((s3AccessKeyId === undefined) !== (s3SecretAccessKey === undefined)) {
    throw new Error(
      'S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be provided together',
    );
  }

  return {
    ...config,
    NODE_ENV: nodeEnvironment,
    DATABASE_URL: parseUrl(databaseUrl, 'DATABASE_URL', [
      'postgres:',
      'postgresql:',
    ]),
    API_HOST: parseHost(config.API_HOST),
    API_PORT: parsePort(config.PORT ?? config.API_PORT),
    WEB_ORIGIN: parseWebOrigin(
      config.WEB_ORIGIN ?? config.FRONTEND_URL ?? 'http://localhost:3000',
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
    S3_REGION: s3Region,
    S3_BUCKET: s3Bucket,
    S3_ENDPOINT: parseS3Endpoint(s3Endpoint),
    S3_URL_STYLE: parseS3UrlStyle(s3UrlStyle),
    S3_ACCESS_KEY_ID: s3AccessKeyId,
    S3_SECRET_ACCESS_KEY: s3SecretAccessKey,
    GOOGLE_PLACES_API_KEY: googlePlacesApiKey,
    RESEND_API_KEY: resendApiKey,
    EMAIL_FROM: emailFrom,
    GOOGLE_OAUTH_CLIENT_ID: googleOauthClientId,
    GOOGLE_OAUTH_CLIENT_SECRET: googleOauthClientSecret,
    KAKAO_OAUTH_CLIENT_ID: kakaoOauthClientId,
    KAKAO_OAUTH_CLIENT_SECRET: kakaoOauthClientSecret,
    APPLE_OAUTH_CLIENT_ID: appleOauthClientId,
    APPLE_OAUTH_TEAM_ID: appleOauthTeamId,
    APPLE_OAUTH_KEY_ID: appleOauthKeyId,
    APPLE_OAUTH_PRIVATE_KEY: appleOauthPrivateKey?.replace(/\\n/g, '\n'),
    OAUTH_TOKEN_ENCRYPTION_KEY: oauthTokenEncryptionKey,
  };
}
