import { problemFromResponse } from './problem-details';
import { isParticipantBadge, type PublicParticipant } from './participants';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

export const questionCategories = [
  'WEATHER',
  'TRANSPORT',
  'FOOD',
  'PLACE',
  'WAITING',
  'CROWD',
  'OPEN_HOURS',
  'EVENT',
  'SAFETY',
  'OTHER',
] as const;
export type QuestionCategory = (typeof questionCategories)[number];
export type QuestionUrgency = 'NORMAL' | 'URGENT';
export type QuestionStatus = 'OPEN' | 'RESOLVED' | 'REMOVED' | 'EXPIRED';
export type QuestionListStatus = 'OPEN' | 'RESOLVED';
export type AnswerSourceType =
  | 'ON_SITE_NOW'
  | 'RECENT_EXPERIENCE'
  | 'OFFICIAL_SOURCE'
  | 'PERSONAL_OPINION';
export type CrowdLevel = 'QUIET' | 'MODERATE' | 'BUSY' | 'VERY_BUSY';
export type EntryStatus = 'OPEN' | 'LIMITED' | 'PAUSED' | 'CLOSED' | 'UNKNOWN';

export interface FieldObservation {
  waitMinutes: number | null;
  crowdLevel: CrowdLevel | null;
  entryStatus: EntryStatus | null;
  observedAt: string;
}

export type QuestionAuthor = PublicParticipant;

export interface AnswerAuthor {
  id: string;
  nickname: string;
  badge: 'VERIFIED_TRAVELER' | 'VERIFIED_LOCAL' | 'VERIFIED_BOTH';
  verifiedAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  author: AnswerAuthor;
  content: string;
  contentFormat: 'PLAIN_TEXT';
  sourceType: AnswerSourceType;
  sourceUrl: string | null;
  removed: boolean;
  image: { url: string; originalName: string; mimeType: string } | null;
  observation: FieldObservation | null;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  roomId: string;
  author: QuestionAuthor;
  category: QuestionCategory;
  urgency: QuestionUrgency;
  content: string;
  contentFormat: 'PLAIN_TEXT';
  areaText: string | null;
  sourceMessageId: string | null;
  status: QuestionStatus;
  safetyNotice: string | null;
  answerCount: number;
  acceptedAnswerId: string | null;
  expiresAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDetail extends Question {
  answers: Answer[];
  liveSummary: {
    freshness: 'LIVE' | 'STALE';
    responseCount: number;
    agreementCount: number;
    waitMinutes: { min: number; max: number } | null;
    crowdLevel: CrowdLevel | null;
    entryStatus: EntryStatus | null;
    lastObservedAt: string;
    recommendedRecheckAt: string;
    staleAfter: string;
    description: string;
  } | null;
}

export interface QuestionPage {
  items: Question[];
  nextCursor: string | null;
}

export interface CreateQuestionInput {
  category: QuestionCategory;
  urgency: QuestionUrgency;
  content?: string;
  areaText?: string;
  sourceMessageId?: string;
}

export interface CreateAnswerInput {
  content: string;
  sourceType: AnswerSourceType;
  sourceUrl?: string | null;
  waitMinutes?: number;
  crowdLevel?: CrowdLevel;
  entryStatus?: EntryStatus;
  observedAt?: string;
}

function parseQuestionAuthor(value: unknown): QuestionAuthor {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.nickname !== 'string' ||
    !isParticipantBadge(value.badge)
  ) {
    throw new Error('질문 작성자 응답 형식이 올바르지 않습니다.');
  }
  return { id: value.id, nickname: value.nickname, badge: value.badge };
}

function parseAnswerAuthor(value: unknown): AnswerAuthor {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.nickname !== 'string' ||
    !isParticipantBadge(value.badge) ||
    !isIsoDate(value.verifiedAt)
  ) {
    throw new Error('답변 작성자 응답 형식이 올바르지 않습니다.');
  }
  return {
    id: value.id,
    nickname: value.nickname,
    badge: value.badge,
    verifiedAt: value.verifiedAt,
  };
}

export function parseAnswer(value: unknown): Answer {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.questionId !== 'string' ||
    typeof value.content !== 'string' ||
    value.contentFormat !== 'PLAIN_TEXT' ||
    ![
      'ON_SITE_NOW',
      'RECENT_EXPERIENCE',
      'OFFICIAL_SOURCE',
      'PERSONAL_OPINION',
    ].includes(String(value.sourceType)) ||
    (value.sourceUrl !== null && typeof value.sourceUrl !== 'string') ||
    typeof value.removed !== 'boolean' ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt)
  ) {
    throw new Error('답변 응답 형식이 올바르지 않습니다.');
  }
  const observation = value.observation;
  const image = value.image;
  if (
    image !== undefined &&
    image !== null &&
    (!isRecord(image) ||
      typeof image.url !== 'string' ||
      typeof image.originalName !== 'string' ||
      typeof image.mimeType !== 'string')
  )
    throw new Error('답변 이미지 응답 형식이 올바르지 않습니다.');
  if (
    observation !== undefined &&
    observation !== null &&
    (!isRecord(observation) ||
      (observation.waitMinutes !== null &&
        (typeof observation.waitMinutes !== 'number' ||
          !Number.isInteger(observation.waitMinutes) ||
          observation.waitMinutes < 0)) ||
      (observation.crowdLevel !== null &&
        !['QUIET', 'MODERATE', 'BUSY', 'VERY_BUSY'].includes(
          String(observation.crowdLevel),
        )) ||
      (observation.entryStatus !== null &&
        !['OPEN', 'LIMITED', 'PAUSED', 'CLOSED', 'UNKNOWN'].includes(
          String(observation.entryStatus),
        )) ||
      !isIsoDate(observation.observedAt))
  )
    throw new Error('현장 관찰 응답 형식이 올바르지 않습니다.');
  if (typeof value.sourceUrl === 'string') {
    let url: URL;
    try {
      url = new URL(value.sourceUrl);
    } catch {
      throw new Error('답변 출처 URL 형식이 올바르지 않습니다.');
    }
    if (url.protocol !== 'https:') {
      throw new Error('답변 출처 URL 형식이 올바르지 않습니다.');
    }
  }
  return {
    id: value.id,
    questionId: value.questionId,
    author: parseAnswerAuthor(value.author),
    content: value.content,
    contentFormat: value.contentFormat,
    sourceType: value.sourceType as AnswerSourceType,
    sourceUrl: value.sourceUrl,
    removed: value.removed,
    observation: (observation ?? null) as FieldObservation | null,
    image: (image ?? null) as Answer['image'],
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function parseQuestion(value: unknown): Question {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.roomId !== 'string' ||
    !questionCategories.includes(value.category as QuestionCategory) ||
    (value.urgency !== 'NORMAL' && value.urgency !== 'URGENT') ||
    typeof value.content !== 'string' ||
    value.contentFormat !== 'PLAIN_TEXT' ||
    (value.areaText !== null && typeof value.areaText !== 'string') ||
    (value.sourceMessageId !== null &&
      typeof value.sourceMessageId !== 'string') ||
    !['OPEN', 'RESOLVED', 'REMOVED', 'EXPIRED'].includes(
      String(value.status),
    ) ||
    (value.safetyNotice !== null && typeof value.safetyNotice !== 'string') ||
    typeof value.answerCount !== 'number' ||
    !Number.isInteger(value.answerCount) ||
    value.answerCount < 0 ||
    (value.acceptedAnswerId !== null &&
      typeof value.acceptedAnswerId !== 'string') ||
    !isIsoDate(value.expiresAt) ||
    (value.resolvedAt !== null && !isIsoDate(value.resolvedAt)) ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt)
  ) {
    throw new Error('질문 응답 형식이 올바르지 않습니다.');
  }
  return {
    id: value.id,
    roomId: value.roomId,
    author: parseQuestionAuthor(value.author),
    category: value.category as QuestionCategory,
    urgency: value.urgency,
    content: value.content,
    contentFormat: value.contentFormat,
    areaText: value.areaText,
    sourceMessageId: value.sourceMessageId,
    status: value.status as QuestionStatus,
    safetyNotice: value.safetyNotice,
    answerCount: value.answerCount,
    acceptedAnswerId: value.acceptedAnswerId,
    expiresAt: value.expiresAt,
    resolvedAt: value.resolvedAt,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function parseQuestionDetail(value: unknown): QuestionDetail {
  if (!isRecord(value) || !Array.isArray(value.answers)) {
    throw new Error('질문 상세 응답 형식이 올바르지 않습니다.');
  }
  const summary = value.liveSummary;
  if (
    summary !== undefined &&
    summary !== null &&
    (!isRecord(summary) ||
      !['LIVE', 'STALE'].includes(String(summary.freshness)) ||
      !Number.isInteger(summary.responseCount) ||
      !Number.isInteger(summary.agreementCount) ||
      (summary.waitMinutes !== null &&
        (!isRecord(summary.waitMinutes) ||
          !Number.isInteger(summary.waitMinutes.min) ||
          !Number.isInteger(summary.waitMinutes.max))) ||
      (summary.crowdLevel !== null &&
        !['QUIET', 'MODERATE', 'BUSY', 'VERY_BUSY'].includes(
          String(summary.crowdLevel),
        )) ||
      (summary.entryStatus !== null &&
        !['OPEN', 'LIMITED', 'PAUSED', 'CLOSED', 'UNKNOWN'].includes(
          String(summary.entryStatus),
        )) ||
      !isIsoDate(summary.lastObservedAt) ||
      !isIsoDate(summary.recommendedRecheckAt) ||
      !isIsoDate(summary.staleAfter) ||
      typeof summary.description !== 'string')
  )
    throw new Error('현장 현황 응답 형식이 올바르지 않습니다.');
  return {
    ...parseQuestion(value),
    answers: value.answers.map(parseAnswer),
    liveSummary: (summary ?? null) as QuestionDetail['liveSummary'],
  };
}

export function parseQuestionPage(value: unknown): QuestionPage {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    (value.nextCursor !== null && typeof value.nextCursor !== 'string')
  ) {
    throw new Error('질문 목록 응답 형식이 올바르지 않습니다.');
  }
  return {
    items: value.items.map(parseQuestion),
    nextCursor: value.nextCursor,
  };
}

async function apiJson(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body === undefined
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  });
  if (!response.ok) throw await problemFromResponse(response);
  return response.json() as Promise<unknown>;
}

export async function getQuestionPage(
  roomSlug: string,
  status: QuestionListStatus,
  category?: QuestionCategory,
  cursor?: string,
): Promise<QuestionPage> {
  const query = new URLSearchParams({ status, limit: '20' });
  if (category !== undefined) query.set('category', category);
  if (cursor !== undefined) query.set('cursor', cursor);
  return parseQuestionPage(
    await apiJson(
      `/api/v1/rooms/${encodeURIComponent(roomSlug)}/questions?${query.toString()}`,
    ),
  );
}

export async function createQuestion(
  roomSlug: string,
  input: CreateQuestionInput,
): Promise<Question> {
  return parseQuestion(
    await apiJson(`/api/v1/rooms/${encodeURIComponent(roomSlug)}/questions`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  );
}

export async function getQuestion(questionId: string): Promise<QuestionDetail> {
  return parseQuestionDetail(
    await apiJson(`/api/v1/questions/${encodeURIComponent(questionId)}`),
  );
}

export async function createAnswer(
  questionId: string,
  input: CreateAnswerInput,
): Promise<Answer> {
  return parseAnswer(
    await apiJson(
      `/api/v1/questions/${encodeURIComponent(questionId)}/answers`,
      { method: 'POST', body: JSON.stringify(input) },
    ),
  );
}

export async function createAnswerWithImage(
  questionId: string,
  input: CreateAnswerInput,
  image: File,
): Promise<Answer> {
  const body = new FormData();
  body.set('image', image);
  body.set('content', input.content);
  body.set('sourceType', input.sourceType);
  if (input.sourceUrl) body.set('sourceUrl', input.sourceUrl);
  if (input.waitMinutes !== undefined)
    body.set('waitMinutes', String(input.waitMinutes));
  if (input.crowdLevel) body.set('crowdLevel', input.crowdLevel);
  if (input.entryStatus) body.set('entryStatus', input.entryStatus);
  if (input.observedAt) body.set('observedAt', input.observedAt);
  const response = await fetch(
    `/api/v1/questions/${encodeURIComponent(questionId)}/answers/images`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      body,
    },
  );
  if (!response.ok) throw await problemFromResponse(response);
  return parseAnswer(await response.json());
}

export async function acceptAnswer(
  questionId: string,
  answerId: string,
): Promise<QuestionDetail> {
  return parseQuestionDetail(
    await apiJson(
      `/api/v1/questions/${encodeURIComponent(questionId)}/accept-answer`,
      { method: 'PATCH', body: JSON.stringify({ answerId }) },
    ),
  );
}

export async function resolveQuestion(
  questionId: string,
): Promise<QuestionDetail> {
  return parseQuestionDetail(
    await apiJson(
      `/api/v1/questions/${encodeURIComponent(questionId)}/resolve`,
      { method: 'PATCH', body: JSON.stringify({}) },
    ),
  );
}
