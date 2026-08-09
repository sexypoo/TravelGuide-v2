import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProblemException } from '../common/http/problem.exception';
import type { Environment } from '../config/environment';
import type {
  GooglePlaceListResponse,
  GooglePlaceResponse,
} from './dto/place.response';
import type { NearbyPlacesDto, SearchPlacesDto } from './dto/search-places.dto';

const TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const NEARBY_SEARCH_URL =
  'https://places.googleapis.com/v1/places:searchNearby';
const BASE_FIELDS = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.googleMapsUri',
  'places.primaryTypeDisplayName',
  'places.businessStatus',
].join(',');

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

@Injectable()
export class PlacesService {
  constructor(private readonly config: ConfigService<Environment, true>) {}

  async search(query: SearchPlacesDto): Promise<GooglePlaceListResponse> {
    const location = this.location(query.latitude, query.longitude);
    return this.request(TEXT_SEARCH_URL, BASE_FIELDS, {
      textQuery: query.q,
      languageCode: 'ko',
      regionCode: 'KR',
      maxResultCount: 10,
      ...(location === null
        ? {}
        : {
            locationBias: {
              circle: { center: location, radius: 20_000 },
            },
          }),
    });
  }

  async nearbyRestaurants(
    query: NearbyPlacesDto,
  ): Promise<GooglePlaceListResponse> {
    const result = await this.request(
      NEARBY_SEARCH_URL,
      `${BASE_FIELDS},places.currentOpeningHours`,
      {
        includedTypes: ['restaurant', 'cafe', 'bakery'],
        maxResultCount: 20,
        rankPreference: 'DISTANCE',
        languageCode: 'ko',
        regionCode: 'KR',
        locationRestriction: {
          circle: {
            center: {
              latitude: query.latitude,
              longitude: query.longitude,
            },
            radius: query.radius,
          },
        },
      },
    );
    return query.openNow
      ? {
          items: result.items.filter((place) => place.openNow === true),
        }
      : result;
  }

  private location(
    latitude: number | undefined,
    longitude: number | undefined,
  ): { latitude: number; longitude: number } | null {
    if (latitude === undefined && longitude === undefined) return null;
    if (latitude === undefined || longitude === undefined) {
      throw new ProblemException(
        'PLACE_LOCATION_INCOMPLETE',
        '현재 위치의 위도와 경도를 함께 보내 주세요.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { latitude, longitude };
  }

  private async request(
    url: string,
    fields: string,
    body: Record<string, unknown>,
  ): Promise<GooglePlaceListResponse> {
    const apiKey = this.config.get('GOOGLE_PLACES_API_KEY', { infer: true });
    if (apiKey === undefined) {
      throw new ProblemException(
        'GOOGLE_PLACES_NOT_CONFIGURED',
        'Google 장소 검색이 아직 설정되지 않았어요.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fields,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(7000),
      });
    } catch {
      throw this.unavailable();
    }
    if (!response.ok) throw this.unavailable();
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw this.unavailable();
    }
    const root = record(payload);
    const places = root?.places;
    if (places === undefined) return { items: [] };
    if (!Array.isArray(places)) throw this.unavailable();
    return { items: places.map((place) => this.parsePlace(place)) };
  }

  private parsePlace(value: unknown): GooglePlaceResponse {
    const place = record(value);
    const displayName = record(place?.displayName);
    const location = record(place?.location);
    const type = record(place?.primaryTypeDisplayName);
    const opening = record(place?.currentOpeningHours);
    if (
      place === null ||
      typeof place.id !== 'string' ||
      typeof displayName?.text !== 'string' ||
      typeof location?.latitude !== 'number' ||
      typeof location.longitude !== 'number'
    ) {
      throw this.unavailable();
    }
    return {
      id: place.id,
      name: displayName.text,
      address:
        typeof place.formattedAddress === 'string'
          ? place.formattedAddress
          : null,
      latitude: location.latitude,
      longitude: location.longitude,
      googleMapsUri:
        typeof place.googleMapsUri === 'string' ? place.googleMapsUri : null,
      category: typeof type?.text === 'string' ? type.text : null,
      businessStatus:
        typeof place.businessStatus === 'string' ? place.businessStatus : null,
      openNow: typeof opening?.openNow === 'boolean' ? opening.openNow : null,
    };
  }

  private unavailable(): ProblemException {
    return new ProblemException(
      'GOOGLE_PLACES_UNAVAILABLE',
      '장소 검색 연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.',
      HttpStatus.BAD_GATEWAY,
    );
  }
}
