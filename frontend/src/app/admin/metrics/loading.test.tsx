import { render, screen } from '@testing-library/react';
import AdminMetricsLoading from './loading';

describe('AdminMetricsLoading', () => {
  it('announces a busy status and hides skeleton blocks', () => {
    render(<AdminMetricsLoading />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent('운영 지표를 불러오는 중이에요');
    const decorative = Array.from(status.children).filter(
      (child) => !child.classList.contains('srOnly'),
    );
    expect(decorative).toHaveLength(4);
    decorative.forEach((child) => {
      expect(child).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
