import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '../../i18n/client';
import { registerPreorder } from '../../lib/api/preorders';
import { PreorderForm } from './preorder-form';

jest.mock('../../lib/api/preorders', () => ({ registerPreorder: jest.fn() }));

const registerPreorderMock = jest.mocked(registerPreorder);

describe('PreorderForm', () => {
  beforeEach(() => registerPreorderMock.mockReset());

  it('shows field errors before making a request', () => {
    render(<PreorderForm />);
    fireEvent.click(screen.getByRole('button', { name: /사전예약 신청하기/ }));

    expect(screen.getByText('이름을 입력해 주세요.')).toBeInTheDocument();
    expect(
      screen.getByText('올바른 이메일 주소를 입력해 주세요.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('개인정보 수집 동의가 필요합니다.'),
    ).toBeInTheDocument();
    expect(registerPreorderMock).not.toHaveBeenCalled();
  });

  it('normalizes, stores, and confirms a valid registration', async () => {
    registerPreorderMock.mockResolvedValue({ status: 'registered' });
    render(<PreorderForm />);
    fireEvent.change(screen.getByLabelText('이름'), {
      target: { value: ' 제주 여행자 ' },
    });
    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: ' Traveler@Example.COM ' },
    });
    fireEvent.click(
      screen.getByRole('checkbox', { name: /이름·이메일 수집에 동의/ }),
    );
    fireEvent.click(screen.getByRole('button', { name: /사전예약 신청하기/ }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      '첫 출발 명단에 등록했어요.',
    );
    expect(registerPreorderMock).toHaveBeenCalledWith({
      name: '제주 여행자',
      email: 'traveler@example.com',
      privacyConsent: true,
    });
  });
});

describe('PreorderForm in English', () => {
  beforeEach(() => registerPreorderMock.mockReset());

  it('shows English labels and field errors', () => {
    render(
      <I18nProvider locale="en">
        <PreorderForm />
      </I18nProvider>,
    );
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Pre-register now/ }));

    expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
    expect(
      screen.getByText('Please enter a valid email address.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please agree to the collection of personal information.',
      ),
    ).toBeInTheDocument();
    expect(registerPreorderMock).not.toHaveBeenCalled();
  });
});
