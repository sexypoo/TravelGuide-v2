import { render, screen } from '@testing-library/react';
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
  AuthForm: ({ nextPath }: { nextPath: string }) => (
    <form aria-label="로그인" data-next-path={nextPath} />
  ),
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

const unsafeNextValues = [
  '//evil.example',
  'https://evil.example',
  '/\\evil.example',
  '/\t/evil.example',
  '/\n/evil.example',
  '/%09/evil.example',
  '/%5Cevil.example',
  '/app\\..\\..\\evil.example',
  '/app/../..//evil.example',
  '/appx',
  '/admin',
  '/auth/login',
];

describe('login page for a signed-in visitor', () => {
  it.each([
    { next: '/app/rooms/jeju', destination: '/app/rooms/jeju' },
    {
      next: '/app/questions/q-1?tab=answers',
      destination: '/app/questions/q-1?tab=answers',
    },
    { next: '/app', destination: '/app' },
    ...unsafeNextValues.map((next) => ({ next, destination: '/app' })),
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

  it.each([
    { next: '/app/rooms/jeju', nextPath: '/app/rooms/jeju' },
    ...unsafeNextValues.map((next) => ({ next, nextPath: '/app' })),
  ])(
    'gives the signed-out login form next=$nextPath for $next',
    async ({ next, nextPath }) => {
      mockedGetCurrentUser.mockResolvedValue(null);

      render(await LoginPage({ searchParams: Promise.resolve({ next }) }));

      expect(mockedRedirect).not.toHaveBeenCalled();
      expect(screen.getByRole('form', { name: '로그인' })).toHaveAttribute(
        'data-next-path',
        nextPath,
      );
    },
  );
});
