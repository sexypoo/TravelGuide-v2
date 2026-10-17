import { render, screen, within } from '@testing-library/react';
import { AppNavigation } from './app-navigation';

jest.mock('next/navigation', () => ({
  usePathname: () => '/app/nearby',
}));

describe('AppNavigation', () => {
  it('promotes the real-time room while keeping nearby and verification available', () => {
    render(<AppNavigation />);

    expect(
      within(screen.getByRole('list'))
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['홈', '도움방', '커뮤니티', '주변', '내 정보']);

    expect(screen.getByRole('link', { name: '주변' })).toHaveAttribute(
      'href',
      '/app/nearby',
    );
    expect(screen.getByRole('link', { name: '주변' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.queryByRole('link', { name: '인증' }),
    ).not.toBeInTheDocument();
  });
});
