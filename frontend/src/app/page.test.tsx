import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../lib/auth/session';
import Home from './page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('../lib/auth/session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('../components/api-connection-status', () => ({
  ApiConnectionStatus: () => <div>서비스 정상 연결</div>,
}));

const mockedGetCurrentUser = jest.mocked(getCurrentUser);
const mockedRedirect = jest.mocked(redirect);

describe('public home gateway', () => {
  it('leads a signed-out visitor to login and preserves destination context', async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const { container } = render(await Home());

    expect(
      screen.getByRole('heading', {
        name: '로그인하고, 여행지의 지금을 확인하세요.',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '로그인' })).toHaveLength(2);
    expect(screen.getByRole('link', { name: /계정 만들기/ })).toHaveAttribute(
      'href',
      '/auth/register',
    );
    expect(
      screen.getByRole('link', { name: /제주 실시간 도움방/ }),
    ).toHaveAttribute('href', '/auth/login?next=%2Fapp%2Frooms%2Fjeju');
    expect(
      screen.getByRole('link', { name: /여행자 커뮤니티/ }),
    ).toHaveAttribute('href', '/auth/login?next=%2Fapp%2Fcommunity');
    expect(
      screen.getByRole('list', { name: '서비스 이용 순서' }),
    ).toHaveTextContent('인증질문답변');
    expect(container.querySelector('.landingHero')).toBeNull();
  });

  it.each([
    { isAdmin: false, destination: '/app' },
    { isAdmin: true, destination: '/admin' },
  ])('redirects an authenticated visitor to $destination', async (scenario) => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      nickname: '제주여행자',
      role: scenario.isAdmin ? 'ADMIN' : 'USER',
      isAdmin: scenario.isAdmin,
      createdAt: '2026-08-01T00:00:00.000Z',
      verificationSummary: { traveler: null, local: null },
    });

    await Home();

    expect(mockedRedirect).toHaveBeenCalledWith(scenario.destination);
  });
});
