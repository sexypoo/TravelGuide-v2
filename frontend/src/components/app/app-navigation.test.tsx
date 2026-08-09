import { render, screen } from '@testing-library/react';
import { AppNavigation } from './app-navigation';

jest.mock('next/navigation', () => ({
  usePathname: () => '/app/nearby',
}));

describe('AppNavigation', () => {
  it('promotes nearby discovery while keeping verification in the profile flow', () => {
    render(<AppNavigation />);

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
