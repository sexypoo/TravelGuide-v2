import type { TravelRecord } from '@prisma/client';

export interface TravelRecordResponse {
  id: string;
  title: string;
  destination: string;
  startedOn: string;
  endedOn: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toTravelRecordResponse(
  record: TravelRecord,
): TravelRecordResponse {
  return {
    id: record.id,
    title: record.title,
    destination: record.destination,
    startedOn: record.startedOn.toISOString().slice(0, 10),
    endedOn: record.endedOn.toISOString().slice(0, 10),
    note: record.note,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
