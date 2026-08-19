import { requestJson, requestVoid } from './client';
import { isRecord } from './runtime';

function isDateOnly(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/u.test(value);
}

export interface TravelRecord {
  id: string;
  title: string;
  destination: string;
  startedOn: string;
  endedOn: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveTravelRecordInput {
  title: string;
  destination: string;
  startedOn: string;
  endedOn: string;
  note: string | null;
}

export function parseTravelRecord(value: unknown): TravelRecord {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.destination !== 'string' ||
    !isDateOnly(value.startedOn) ||
    !isDateOnly(value.endedOn) ||
    (value.note !== null && typeof value.note !== 'string') ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string'
  ) {
    throw new Error('여행 기록 응답 형식이 올바르지 않습니다.');
  }
  return {
    id: value.id,
    title: value.title,
    destination: value.destination,
    startedOn: value.startedOn,
    endedOn: value.endedOn,
    note: value.note,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

async function mutate(
  path: string,
  method: 'POST' | 'PATCH',
  input: SaveTravelRecordInput,
): Promise<TravelRecord> {
  const value = await requestJson(path, {
    method,
    body: JSON.stringify(input),
  });
  return parseTravelRecord(value);
}

export async function listTravelRecords(): Promise<TravelRecord[]> {
  const value = await requestJson('/api/v1/travel-records');
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new Error('여행 기록 목록 형식이 올바르지 않습니다.');
  }
  return value.items.map(parseTravelRecord);
}

export function createTravelRecord(
  input: SaveTravelRecordInput,
): Promise<TravelRecord> {
  return mutate('/api/v1/travel-records', 'POST', input);
}

export function updateTravelRecord(
  id: string,
  input: SaveTravelRecordInput,
): Promise<TravelRecord> {
  return mutate(
    `/api/v1/travel-records/${encodeURIComponent(id)}`,
    'PATCH',
    input,
  );
}

export async function deleteTravelRecord(id: string): Promise<void> {
  await requestVoid(`/api/v1/travel-records/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
}
