import { fireEvent, render, screen } from '@testing-library/react';
import { TravelerVerificationForm } from './traveler-verification-form';

const pushMock = jest.fn();
const refreshMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

describe('TravelerVerificationForm', () => {
  it('contains native date controls in clipped visual frames', () => {
    const { container } = render(
      <TravelerVerificationForm destinationId="destination-jeju" />,
    );
    expect(container.querySelectorAll('.dateInputFrame')).toHaveLength(2);
    for (const input of container.querySelectorAll('input[type="date"]')) {
      expect(input.parentElement).toHaveClass('dateInputFrame');
    }
  });

  it('directs the user to complete dates before uploading', () => {
    render(<TravelerVerificationForm destinationId="destination-jeju" />);
    fireEvent.click(
      screen.getByRole('button', { name: '여행자 인증 신청하기' }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent('여행 시작일과 종료일');
  });

  it('rejects an oversized proof before making a request', () => {
    render(<TravelerVerificationForm destinationId="destination-jeju" />);
    fireEvent.change(screen.getByLabelText('시작일'), {
      target: { value: '2099-08-01' },
    });
    fireEvent.change(screen.getByLabelText('종료일'), {
      target: { value: '2099-08-02' },
    });
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.jpg', {
      type: 'image/jpeg',
    });
    fireEvent.change(screen.getByLabelText(/증빙 파일 선택/), {
      target: { files: [file] },
    });
    fireEvent.click(
      screen.getByRole('button', { name: '여행자 인증 신청하기' }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent('5MB 이하');
  });
});
