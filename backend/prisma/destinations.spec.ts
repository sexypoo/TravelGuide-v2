import { DESTINATIONS, roomTitle } from './destinations';

describe('destination seeds', () => {
  it('keep Jeju and use unique, URL-safe slugs', () => {
    const slugs = DESTINATIONS.map((destination) => destination.slug);
    expect(slugs).toContain('jeju');
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z][a-z-]{1,63}$/);
  });

  it('hold coordinates and radii the schema can store', () => {
    for (const destination of DESTINATIONS) {
      const latitude = Number(destination.centerLatitude);
      const longitude = Number(destination.centerLongitude);
      const radius = Number(destination.radiusKm);
      expect(latitude).toBeGreaterThanOrEqual(-90);
      expect(latitude).toBeLessThanOrEqual(90);
      expect(longitude).toBeGreaterThanOrEqual(-180);
      expect(longitude).toBeLessThanOrEqual(180);
      expect(radius).toBeGreaterThan(0);
      expect(radius).toBeLessThan(10000);
      expect(destination.countryCode).toMatch(/^[A-Z]{2}$/);
      expect(
        () => new Intl.DateTimeFormat('ko', { timeZone: destination.timezone }),
      ).not.toThrow();
    }
  });

  it('names each room after its destination', () => {
    expect(roomTitle('런던')).toBe('런던 실시간 여행 도움방');
  });
});
