import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getNearbyOpenRestaurants, type GooglePlace } from '@/lib/api/places';
import { NearbyPlacesExplorer } from './nearby-places-explorer';

jest.mock('../../lib/api/places', () => ({
  getNearbyOpenRestaurants: jest.fn(),
}));

const nearbyMock = jest.mocked(getNearbyOpenRestaurants);
const place: GooglePlace = {
  id: 'place-1',
  name: '동백식당',
  address: '제주시 바다로 1',
  latitude: 33.5,
  longitude: 126.5,
  googleMapsUri: 'https://maps.google.com/example',
  category: '한식당',
  businessStatus: 'OPERATIONAL',
  openNow: true,
};

type PositionSuccess = (position: {
  coords: { latitude: number; longitude: number };
}) => void;
type PositionFailure = (error: {
  code: number;
  message: string;
  PERMISSION_DENIED: 1;
  POSITION_UNAVAILABLE: 2;
  TIMEOUT: 3;
}) => void;

const PERMISSION_MESSAGE =
  '위치 권한이 꺼져 있어요. 브라우저 설정에서 위치 접근을 허용해 주세요.';
const TIMEOUT_MESSAGE =
  '위치 확인 시간이 초과됐어요. 열린 장소에서 다시 시도해 주세요.';
const UNAVAILABLE_MESSAGE =
  '현재 위치를 확인할 수 없어요. 기기의 위치 서비스를 확인해 주세요.';

function succeed(success: PositionSuccess): void {
  success({ coords: { latitude: 33.49, longitude: 126.53 } });
}

function failWith(code: number) {
  return (_success: PositionSuccess, failure: PositionFailure): void => {
    failure({
      code,
      message: 'location failed',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    });
  };
}

function mockGeolocation(getCurrentPosition: jest.Mock): void {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition },
  });
}

describe('NearbyPlacesExplorer', () => {
  beforeEach(() => {
    nearbyMock.mockReset();
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  });

  it('uses location only after explicit action and presents open places separately', async () => {
    nearbyMock.mockResolvedValue([place]);
    const getCurrentPosition = jest.fn().mockImplementation((success) => {
      success({ coords: { latitude: 33.49, longitude: 126.53 } });
    });
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    });

    render(<NearbyPlacesExplorer />);
    expect(nearbyMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '내 주변 보기' }));

    await waitFor(() =>
      expect(nearbyMock).toHaveBeenCalledWith({
        latitude: 33.49,
        longitude: 126.53,
      }),
    );
    expect(await screen.findByText('동백식당')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /동백식당 Google 지도/ }),
    ).toHaveAttribute('href', place.googleMapsUri);
    expect(
      screen.getByRole('button', { name: '동백식당 제주시 바다로 1' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('영업 중')).not.toBeInTheDocument();
  });

  it.each([
    [1, PERMISSION_MESSAGE],
    [3, TIMEOUT_MESSAGE],
    [2, UNAVAILABLE_MESSAGE],
  ])(
    'explains geolocation error code %i with a matching message',
    async (code, message) => {
      mockGeolocation(jest.fn().mockImplementation(failWith(code)));

      render(<NearbyPlacesExplorer />);
      fireEvent.click(screen.getByRole('button', { name: '내 주변 보기' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(message);
      expect(screen.getByText('목록을 불러오지 못했어요')).toBeInTheDocument();
      expect(nearbyMock).not.toHaveBeenCalled();
    },
  );

  it('clears the previous results when a re-search fails at the API', async () => {
    nearbyMock
      .mockResolvedValueOnce([place])
      .mockRejectedValueOnce(new Error('network down'));
    mockGeolocation(jest.fn().mockImplementation(succeed));

    render(<NearbyPlacesExplorer />);
    fireEvent.click(screen.getByRole('button', { name: '내 주변 보기' }));
    expect(await screen.findByText('동백식당')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: '현재 위치로 다시 찾기' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '근처 식당을 찾지 못했어요.',
    );
    expect(screen.getByText('목록을 불러오지 못했어요')).toBeInTheDocument();
    expect(screen.queryByText('동백식당')).not.toBeInTheDocument();
    expect(nearbyMock).toHaveBeenCalledTimes(2);
  });

  it('clears the previous results when a re-search times out locating', async () => {
    nearbyMock.mockResolvedValueOnce([place]);
    mockGeolocation(
      jest
        .fn()
        .mockImplementationOnce(succeed)
        .mockImplementationOnce(failWith(3)),
    );

    render(<NearbyPlacesExplorer />);
    fireEvent.click(screen.getByRole('button', { name: '내 주변 보기' }));
    expect(await screen.findByText('동백식당')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: '현재 위치로 다시 찾기' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(TIMEOUT_MESSAGE);
    expect(screen.getByText('목록을 불러오지 못했어요')).toBeInTheDocument();
    expect(screen.queryByText('동백식당')).not.toBeInTheDocument();
    expect(screen.queryByText(/가까운 순서/)).not.toBeInTheDocument();
    expect(nearbyMock).toHaveBeenCalledTimes(1);
  });
});
