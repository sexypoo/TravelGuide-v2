import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../../lib/auth/session';
import RegisterPage from './page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('../../../lib/auth/session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('../../../components/auth/auth-form', () => ({
  AuthForm: ({ mode, nextPath }: { mode: string; nextPath?: string }) => (
    <form
      aria-label="회원가입"
      data-mode={mode}
      data-next-path={nextPath ?? 'missing'}
    />
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

const unsafeNextValues: (string | string[])[] = [
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
  '/adminx',
  '/auth/login',
  ['/app/rooms/jeju', '//evil.example'],
];

describe('register page for a signed-in visitor', () => {
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

    await RegisterPage({ searchParams: Promise.resolve({ next }) });

    expect(mockedRedirect).toHaveBeenCalledWith(destination);
  });

  it('keeps sending an admin to the admin console', async () => {
    signedInUser(true);

    await RegisterPage({
      searchParams: Promise.resolve({ next: '/app/rooms/jeju' }),
    });

    expect(mockedRedirect).toHaveBeenCalledWith('/admin');
  });
});

describe('register page for a signed-out visitor', () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockResolvedValue(null);
  });

  it.each([
    {
      next: '/app/rooms/jeju',
      nextPath: '/app/rooms/jeju',
      href: '/auth/login?next=%2Fapp%2Frooms%2Fjeju',
    },
    {
      next: '/app/community/p-1',
      nextPath: '/app/community/p-1',
      href: '/auth/login?next=%2Fapp%2Fcommunity%2Fp-1',
    },
    { next: '/app', nextPath: '/app', href: '/auth/login' },
    { next: undefined, nextPath: '/app', href: '/auth/login' },
    ...unsafeNextValues.map((next) => ({
      next,
      nextPath: '/app',
      href: '/auth/login',
    })),
  ])(
    'gives the form $nextPath and the login link $href for next=$next',
    async ({ next, nextPath, href }) => {
      render(await RegisterPage({ searchParams: Promise.resolve({ next }) }));

      expect(mockedRedirect).not.toHaveBeenCalled();
      const form = screen.getByRole('form', { name: '회원가입' });
      expect(form).toHaveAttribute('data-mode', 'register');
      expect(form).toHaveAttribute('data-next-path', nextPath);
      expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute(
        'href',
        href,
      );
    },
  );
});
