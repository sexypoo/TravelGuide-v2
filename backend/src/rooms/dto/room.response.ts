import type { Prisma } from '@prisma/client';
import type { RoomAccessResponse } from '../room-access.types';

export type RoomWithDestination = Prisma.DestinationRoomGetPayload<{
  include: { destination: true };
}>;

export interface DestinationResponse {
  id: string;
  slug: string;
  nameKo: string;
  countryCode: string;
  timezone: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radiusKm: number;
}

export interface RoomResponse {
  id: string;
  slug: string;
  title: string;
  destination: DestinationResponse;
  access: RoomAccessResponse;
}

function decimalToNumber(value: Prisma.Decimal): number {
  const parsed = value.toNumber();
  if (!Number.isFinite(parsed)) {
    throw new Error('Destination coordinate is invalid');
  }

  return parsed;
}

export function toRoomResponse(
  room: RoomWithDestination,
  access: RoomAccessResponse,
): RoomResponse {
  return {
    id: room.id,
    slug: room.slug,
    title: room.title,
    destination: {
      id: room.destination.id,
      slug: room.destination.slug,
      nameKo: room.destination.nameKo,
      countryCode: room.destination.countryCode,
      timezone: room.destination.timezone,
      center: {
        latitude: decimalToNumber(room.destination.centerLatitude),
        longitude: decimalToNumber(room.destination.centerLongitude),
      },
      radiusKm: decimalToNumber(room.destination.radiusKm),
    },
    access,
  };
}
