export interface InitialAdminConfig {
  email: string;
  password: string;
  nickname: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function readInitialAdminConfig(
  environment: NodeJS.ProcessEnv = process.env,
): InitialAdminConfig | undefined {
  const email = environment.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = environment.INITIAL_ADMIN_PASSWORD;
  const nickname = environment.INITIAL_ADMIN_NICKNAME?.trim();
  const values = [email, password, nickname];
  const configured = values.some(
    (value) => value !== undefined && value !== '',
  );

  if (!configured && environment.NODE_ENV !== 'production') return undefined;
  if (values.some((value) => value === undefined || value === '')) {
    throw new Error(
      'INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD, and INITIAL_ADMIN_NICKNAME are required in production',
    );
  }

  if (email === undefined || !EMAIL_PATTERN.test(email) || email.length > 320) {
    throw new Error('INITIAL_ADMIN_EMAIL must be a valid email address');
  }
  if (
    password === undefined ||
    password.length < 10 ||
    password.length > 72 ||
    !/[A-Za-z]/u.test(password) ||
    !/\d/u.test(password)
  ) {
    throw new Error(
      'INITIAL_ADMIN_PASSWORD must be 10-72 characters with a letter and digit',
    );
  }
  if (nickname === undefined || nickname.length < 2 || nickname.length > 20) {
    throw new Error('INITIAL_ADMIN_NICKNAME must be 2-20 characters');
  }

  return { email, password, nickname };
}
