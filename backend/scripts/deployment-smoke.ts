import { io } from 'socket.io-client';

interface MembershipResult {
  ok: boolean;
  code?: string;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} is required`);
  }
  return value;
}

async function expectHealthy(baseUrl: string, path: string): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  const payload: unknown = await response.json();
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('status' in payload) ||
    payload.status !== 'ok'
  ) {
    throw new Error(`${path} returned an invalid health payload`);
  }
}

async function login(baseUrl: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: required('SMOKE_EMAIL'),
      password: required('SMOKE_PASSWORD'),
    }),
    redirect: 'manual',
  });
  if (!response.ok) throw new Error(`Login returned ${response.status}`);
  const setCookie = response.headers.get('set-cookie');
  const cookie = setCookie?.split(';', 1)[0];
  if (cookie === undefined || !cookie.startsWith('tg_access=')) {
    throw new Error('Login did not return the secure access cookie');
  }
  for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Lax']) {
    if (!setCookie?.toLowerCase().includes(attribute.toLowerCase())) {
      throw new Error(`Access cookie is missing ${attribute}`);
    }
  }
  return cookie;
}

async function verifySocket(baseUrl: string, cookie: string): Promise<void> {
  const socket = io(baseUrl, {
    path: '/socket.io',
    transports: ['websocket'],
    extraHeaders: { Cookie: cookie },
    reconnection: false,
    timeout: 10_000,
  });
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Socket room join timed out')),
        10_000,
      );
      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      socket.on('connect', () => {
        socket.emit(
          'room.join',
          { roomSlug: process.env.SMOKE_ROOM_SLUG?.trim() || 'jeju' },
          (result: MembershipResult) => {
            clearTimeout(timeout);
            if (!result.ok) {
              reject(new Error(`Socket room join failed: ${result.code}`));
              return;
            }
            resolve();
          },
        );
      });
    });
  } finally {
    socket.close();
  }
}

async function run(): Promise<void> {
  const baseUrl = new URL(required('SMOKE_BASE_URL'));
  if (baseUrl.protocol !== 'https:' || baseUrl.pathname !== '/') {
    throw new Error('SMOKE_BASE_URL must be an HTTPS origin');
  }
  await expectHealthy(baseUrl.origin, '/api/v1/health/live');
  await expectHealthy(baseUrl.origin, '/api/v1/health/ready');
  const cookie = await login(baseUrl.origin);
  await verifySocket(baseUrl.origin, cookie);
  process.stdout.write(
    'HTTPS health, login cookie, and Socket room join passed.\n',
  );
}

void run().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Unknown smoke error';
  process.stderr.write(`Production smoke failed: ${message}\n`);
  process.exitCode = 1;
});
