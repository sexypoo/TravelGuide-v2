import { haversineDistanceKm } from './distance';

describe('haversineDistanceKm', () => {
  it('returns zero for the same coordinate', () => {
    expect(
      haversineDistanceKm(
        { latitude: 33.3617, longitude: 126.5292 },
        { latitude: 33.3617, longitude: 126.5292 },
      ),
    ).toBe(0);
  });

  it('calculates a known approximate distance', () => {
    const distance = haversineDistanceKm(
      { latitude: 33.3617, longitude: 126.5292 },
      { latitude: 37.5665, longitude: 126.978 },
    );
    expect(distance).toBeGreaterThan(460);
    expect(distance).toBeLessThan(480);
  });
});
