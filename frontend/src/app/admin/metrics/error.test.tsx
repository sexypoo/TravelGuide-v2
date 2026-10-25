import { fireEvent, render, screen } from '@testing-library/react';
import AdminMetricsError from './error';

describe('AdminMetricsError', () => {
  it('shows the Korean error copy with retry and admin home actions', () => {
    const reset = jest.fn();
    render(<AdminMetricsError reset={reset} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('운영 지표를 불러오지 못했어요');
    expect(alert).toHaveTextContent(
      '잠시 뒤 다시 시도해 주세요. 계속되면 서버 상태를 확인해 주세요.',
    );
    expect(screen.getByRole('link', { name: '관리자 홈으로' })).toHaveAttribute(
      'href',
      '/admin',
    );

    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
