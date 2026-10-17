import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../lib/auth/session';
import AppLayout from './layout';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('../../lib/auth/session', () => ({
  getCurrentUser: jest.fn(),
  requireUser: jest.fn(),
}));

jest.mock('../../components/app/app-frame', () => ({
  AppFrame: ({
    chrome,
    children,
  }: {
    chrome: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div data-testid="app-frame">
      {chrome}
      {children}
    </div>
  ),
}));

jest.mock('../../components/app/app-navigation', () => ({
  AppNavigation: ({ nickname }: { nickname?: string }) => (
    <nav aria-label="앱 메뉴">{nickname}</nav>
  ),
}));

jest.mock('../../components/providers/app-providers', () => ({
  AppProviders: ({
    currentUserId,
    children,
  }: {
    currentUserId: string;
    children: React.ReactNode;
  }) => <div data-current-user={currentUserId}>{children}</div>,
}));

const mockedGetCurrentUser = jest.mocked(getCurrentUser);
const mockedRedirect = jest.mocked(redirect);

describe('AppLayout', () => {
  it('leaves the login redirect to the page so the exact next path survives', async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    render(await AppLayout({ children: <main>방 내용</main> }));

    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(screen.getByRole('main')).toHaveTextContent('방 내용');
    expect(screen.queryByTestId('app-frame')).toBeNull();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('banner')).toBeNull();
  });

  it('renders the app chrome around the page for a signed-in user', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      nickname: '제주여행자',
      role: 'USER',
      isAdmin: false,
      createdAt: '2026-08-01T00:00:00.000Z',
      verificationSummary: { traveler: null, local: null },
    });

    const { container } = render(
      await AppLayout({ children: <main>방 내용</main> }),
    );

    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(screen.getByTestId('app-frame')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toHaveTextContent('제주여행자');
    // Logout lives on 내 정보, not in the global chrome.
    expect(screen.queryByRole('button', { name: '로그아웃' })).toBeNull();
    expect(
      container.querySelector('[data-current-user="user-1"]'),
    ).not.toBeNull();
    expect(screen.getByRole('main')).toHaveTextContent('방 내용');
  });
});
