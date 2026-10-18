import { render, screen } from '@testing-library/react';
import AppLoading from './loading';

describe('AppLoading', () => {
  it('announces a busy status with Korean screen-reader text', () => {
    render(<AppLoading />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent('화면을 불러오는 중이에요');
  });

  it('hides skeleton blocks from assistive tech and drops legacy classes', () => {
    const { container } = render(<AppLoading />);

    const status = screen.getByRole('status');
    const decorative = Array.from(status.children).filter(
      (child) => !child.classList.contains('srOnly'),
    );
    expect(decorative.length).toBeGreaterThan(0);
    decorative.forEach((child) => {
      expect(child).toHaveAttribute('aria-hidden', 'true');
    });
    expect(container.innerHTML).not.toContain('appSkeleton');
  });
});
