export interface GooglePlaceResponse {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  googleMapsUri: string | null;
  category: string | null;
  businessStatus: string | null;
  openNow: boolean | null;
}

export interface GooglePlaceListResponse {
  items: GooglePlaceResponse[];
}
