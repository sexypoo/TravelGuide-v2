export function loadGoogleMaps(
  apiKey: string,
): Promise<TravelGuideGoogleMapsNamespace> {
  if (window.google !== undefined) return Promise.resolve(window.google);
  if (window.travelGuideGoogleMapsPromise !== undefined) {
    return window.travelGuideGoogleMapsPromise;
  }
  window.travelGuideGoogleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: apiKey,
      v: 'weekly',
      language: 'ko',
      region: 'KR',
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onload = () => {
      if (window.google === undefined) {
        reject(new Error('Google Maps did not initialize'));
        return;
      }
      resolve(window.google);
    };
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.append(script);
  });
  return window.travelGuideGoogleMapsPromise;
}
