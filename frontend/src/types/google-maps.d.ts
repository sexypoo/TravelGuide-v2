interface TravelGuideGoogleMap {
  setCenter(position: { lat: number; lng: number }): void;
  setZoom(zoom: number): void;
}

interface TravelGuideGoogleMarker {
  setMap(map: TravelGuideGoogleMap | null): void;
}

interface TravelGuideGoogleMapsNamespace {
  maps: {
    Map: new (
      element: HTMLElement,
      options: {
        center: { lat: number; lng: number };
        zoom: number;
        disableDefaultUI: boolean;
        zoomControl: boolean;
      },
    ) => TravelGuideGoogleMap;
    Marker: new (options: {
      map: TravelGuideGoogleMap;
      position: { lat: number; lng: number };
      title: string;
    }) => TravelGuideGoogleMarker;
  };
}

interface Window {
  google?: TravelGuideGoogleMapsNamespace;
  travelGuideGoogleMapsPromise?: Promise<TravelGuideGoogleMapsNamespace>;
}
