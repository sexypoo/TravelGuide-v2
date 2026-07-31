import { fireEvent, render, screen } from '@testing-library/react';
import { LocalVerificationForm } from './local-verification-form';

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

describe('LocalVerificationForm', () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
  });

  it('shows only Jeju inclusion and accuracy after location capture', async () => {
    const position: GeolocationPosition = {
      coords: {
        latitude: 33.3617,
        longitude: 126.5292,
        accuracy: 83,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
      },
      timestamp: new Date('2026-07-31T12:00:00.000Z').getTime(),
      toJSON: () => ({}),
    };
    const getCurrentPosition = jest.fn((success: PositionCallback) =>
      success(position),
    );
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    });
    render(
      <LocalVerificationForm
        destination={{
          id: 'destination-jeju',
          center: { latitude: 33.3617, longitude: 126.5292 },
          radiusKm: 80,
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '현재 위치 확인' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      '제주 안에서 확인했어요 · 정확도 83m',
    );
    expect(screen.queryByText(/33\.3617|126\.5292/)).not.toBeInTheDocument();
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 },
    );
  });

  it('requires location before submitting', () => {
    render(
      <LocalVerificationForm
        destination={{
          id: 'destination-jeju',
          center: { latitude: 33.3617, longitude: 126.5292 },
          radiusKm: 80,
        }}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: '현지인 인증 신청하기' }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      '현재 위치를 먼저 확인',
    );
  });
});
