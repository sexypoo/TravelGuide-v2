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
  });
});
