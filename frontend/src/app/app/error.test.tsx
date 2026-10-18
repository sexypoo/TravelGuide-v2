import { fireEvent, render, screen } from '@testing-library/react';
import ErrorPage from './error';

describe('App ErrorPage', () => {
  it('shows the Korean error copy in an alert', () => {
    render(<ErrorPage reset={jest.fn()} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('화면을 불러오지 못했어요');
    expect(alert).toHaveTextContent(
      '연결 상태를 확인한 뒤 다시 시도해 주세요.',
    );
    expect(alert.innerHTML).not.toContain('appError');
  });

  it('calls reset once when retry is pressed', () => {
    const reset = jest.fn();
    render(<ErrorPage reset={reset} />);

    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
