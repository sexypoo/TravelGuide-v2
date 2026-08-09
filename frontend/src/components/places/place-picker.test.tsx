import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  getNearbyOpenRestaurants,
  searchPlaces,
  type GooglePlace,
} from '@/lib/api/places';
import { PlacePicker } from './place-picker';

jest.mock('../../lib/api/places', () => ({
  getNearbyOpenRestaurants: jest.fn(),
  searchPlaces: jest.fn(),
}));

const searchPlacesMock = jest.mocked(searchPlaces);
const nearbyMock = jest.mocked(getNearbyOpenRestaurants);
const place: GooglePlace = {
  id: 'ChIJ-google-place',
  name: '동백식당',
  address: '제주시 바다로 1',
  latitude: 33.5,
  longitude: 126.5,
  googleMapsUri: 'https://maps.google.com/?cid=1',
  category: '한식당',
  businessStatus: 'OPERATIONAL',
  openNow: true,
};

describe('PlacePicker', () => {
  beforeEach(() => {
    searchPlacesMock.mockReset();
    nearbyMock.mockReset();
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  });

  it('searches, selects, and confirms a Google place', async () => {
    const onSelect = jest.fn();
    searchPlacesMock.mockResolvedValue([place]);
    render(<PlacePicker onClose={jest.fn()} onSelect={onSelect} />);

    fireEvent.change(screen.getByLabelText('장소 검색어'), {
      target: { value: '동백식당' },
    });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    expect(await screen.findByText('제주시 바다로 1')).toBeInTheDocument();
    expect(searchPlacesMock).toHaveBeenCalledWith('동백식당', {
      latitude: 33.4996,
      longitude: 126.5312,
    });
    fireEvent.click(screen.getByRole('button', { name: /동백식당/ }));
    fireEvent.click(screen.getByRole('button', { name: '이 장소 선택' }));
    expect(onSelect).toHaveBeenCalledWith(place);
  });

  it('loads open restaurants only after explicit geolocation action', async () => {
    nearbyMock.mockResolvedValue([place]);
    const getCurrentPosition = jest.fn().mockImplementation((success) => {
      success({ coords: { latitude: 37.5, longitude: 127 } });
    });
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    });
    render(<PlacePicker onClose={jest.fn()} onSelect={jest.fn()} />);

    expect(nearbyMock).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', { name: /현재 위치 근처 영업 중 식당/ }),
    );

    await waitFor(() =>
      expect(nearbyMock).toHaveBeenCalledWith({
        latitude: 37.5,
        longitude: 127,
      }),
    );
    expect(await screen.findByText('영업 중')).toBeInTheDocument();
  });

  it('validates short searches and closes without making a request', () => {
    const onClose = jest.fn();
    render(<PlacePicker onClose={onClose} onSelect={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('장소 검색어'), {
      target: { value: '제' },
    });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    expect(
      screen.getByText('장소 이름을 두 글자 이상 입력해 주세요.'),
    ).toBeInTheDocument();
    expect(searchPlacesMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '장소 선택 닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
