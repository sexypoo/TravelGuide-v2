import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../../lib/auth/session';
import LoginPage from './page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('../../../lib/auth/session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('../../../components/auth/auth-shell', () => ({
  AuthShell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('../../../components/auth/auth-form', () => ({
  AuthForm: () => <form aria-label="로그인" />,
}));

const mockedGetCurrentUser = jest.mocked(getCurrentUser);
const mockedRedirect = jest.mocked(redirect);

function signedInUser(isAdmin: boolean): void {
  mockedGetCurrentUser.mockResolvedValue({
    id: 'user-1',
    email: 'user@example.com',
    nickname: '제주여행자',
    role: isAdmin ? 'ADMIN' : 'USER',
    isAdmin,
    createdAt: '2026-08-01T00:00:00.000Z',
    verificationSummary: { traveler: null, local: null },
  });
}

describe('login page for a signed-in visitor', () => {
  it.each([
    { next: '/app/rooms/jeju', destination: '/app/rooms/jeju' },
    { next: '//evil.example', destination: '/app' },
    { next: 'https://evil.example', destination: '/app' },
    { next: undefined, destination: '/app' },
  ])('sends next=$next to $destination', async ({ next, destination }) => {
    signedInUser(false);

    await LoginPage({ searchParams: Promise.resolve({ next }) });

    expect(mockedRedirect).toHaveBeenCalledWith(destination);
  });

  it('keeps sending an admin to the admin console', async () => {
    signedInUser(true);

    await LoginPage({
      searchParams: Promise.resolve({ next: '/app/rooms/jeju' }),
    });

    expect(mockedRedirect).toHaveBeenCalledWith('/admin');
  });

  it('does not redirect a signed-out visitor', async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    await LoginPage({
      searchParams: Promise.resolve({ next: '/app/rooms/jeju' }),
    });

    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});
