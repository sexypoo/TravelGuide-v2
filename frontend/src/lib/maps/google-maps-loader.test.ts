import { loadGoogleMaps } from './google-maps-loader';

const googleMaps = {
  maps: {
    Map: class {},
    Marker: class {},
  },
} as unknown as TravelGuideGoogleMapsNamespace;

describe('Google Maps loader', () => {
  beforeEach(() => {
    delete window.google;
    delete window.travelGuideGoogleMapsPromise;
    document
      .querySelectorAll('script[src*="maps.googleapis.com"]')
      .forEach((script) => script.remove());
  });

  it('reuses an initialized SDK without adding a script', async () => {
    window.google = googleMaps;

    await expect(loadGoogleMaps('browser-key')).resolves.toBe(googleMaps);
    expect(
      document.querySelector('script[src*="maps.googleapis.com"]'),
    ).toBeNull();
  });

  it('loads the localized SDK once and shares the pending promise', async () => {
    const first = loadGoogleMaps('browser-key');
    const second = loadGoogleMaps('browser-key');
    const script = document.querySelector<HTMLScriptElement>(
      'script[src*="maps.googleapis.com"]',
    );

    expect(script?.src).toContain('key=browser-key');
    expect(script?.src).toContain('language=ko');
    expect(first).toBe(second);
    window.google = googleMaps;
    script?.dispatchEvent(new Event('load'));
    await expect(first).resolves.toBe(googleMaps);
  });

  it('rejects when the SDK script cannot be loaded', async () => {
    const result = loadGoogleMaps('browser-key');
    document
      .querySelector<HTMLScriptElement>('script[src*="maps.googleapis.com"]')
      ?.dispatchEvent(new Event('error'));

    await expect(result).rejects.toThrow('Google Maps failed to load');
  });
});
