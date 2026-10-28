import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { submitLocalVerification } from '../../lib/api/verifications';
import { LocalVerificationForm } from './local-verification-form';

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

jest.mock('../../lib/api/verifications', () => ({
  submitLocalVerification: jest.fn(),
}));

const submitMock = jest.mocked(submitLocalVerification);

function mockGeolocation(coords: {
  latitude: number;
  longitude: number;
  accuracy: number;
}): jest.Mock {
  const position: GeolocationPosition = {
    coords: {
      ...coords,
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
  return getCurrentPosition;
}

describe('LocalVerificationForm', () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    submitMock.mockReset();
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
          nameKo: '제주',
          center: { latitude: 33.3617, longitude: 126.5292 },
          radiusKm: 80,
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '현재 위치 확인' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      '제주 안에서 확인했어요. 정확도 83m',
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
          nameKo: '제주',
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

  it('rounds device GPS coordinates to 6 decimals before submitting', async () => {
    submitMock.mockResolvedValue(undefined);
    mockGeolocation({
      latitude: 33.36171234567,
      longitude: 126.52921234567,
      accuracy: 83.6,
    });
    render(
      <LocalVerificationForm
        destination={{
          id: 'destination-jeju',
          nameKo: '제주',
          center: { latitude: 33.3617, longitude: 126.5292 },
          radiusKm: 80,
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '현재 위치 확인' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      '제주 안에서 확인했어요. 정확도 84m',
    );
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '제주시 노형동에서 5년째 살고 있고 공항 근처 동네를 잘 알아요.',
      },
    });
    const file = new File(['proof'], 'residence.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/연고 증빙 선택/), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(
      screen.getByRole('button', { name: '현지인 인증 신청하기' }),
    );

    await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
    const [data] = submitMock.mock.lastCall ?? [];
    if (data === undefined) throw new Error('FormData was not submitted');
    expect(data.get('latitude')).toBe('33.361712');
    expect(data.get('longitude')).toBe('126.529212');
    expect(data.get('accuracyMeters')).toBe('84');
    for (const key of ['latitude', 'longitude']) {
      const decimals = String(data.get(key)).split('.')[1] ?? '';
      expect(decimals.length).toBeLessThanOrEqual(6);
    }
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(
        '/app/verifications?submitted=local',
      ),
    );
  });
});
