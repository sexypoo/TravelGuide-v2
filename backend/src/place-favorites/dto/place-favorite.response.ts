export interface PlaceFavoriteResponse {
  id: string;
  sourceMessageId: string | null;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface PlaceFavoriteListResponse {
  items: PlaceFavoriteResponse[];
}

export interface RemovePlaceFavoriteResponse {
  saved: false;
}
