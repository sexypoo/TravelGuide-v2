import { problemFromResponse } from './problem-details';

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

export interface QuestionAuthor {
  id: string;
  nickname: string;
  badge: 'VERIFIED_TRAVELER';
}

export interface AnswerAuthor {
  id: string;
  nickname: string;
  badge: 'VERIFIED_LOCAL';
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
  status: QuestionStatus;
  safetyNotice: string | null;
  answerCount: number;
  expiresAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDetail extends Question {
  answers: Answer[];
}

export interface QuestionPage {
  items: Question[];
  nextCursor: string | null;
}

export interface CreateQuestionInput {
  category: QuestionCategory;
  urgency: QuestionUrgency;
  content: string;
  areaText?: string;
}

export interface CreateAnswerInput {
  content: string;
  sourceType: AnswerSourceType;
  sourceUrl?: string | null;
}

function parseQuestionAuthor(value: unknown): QuestionAuthor {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.nickname !== 'string' ||
    value.badge !== 'VERIFIED_TRAVELER'
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
    value.badge !== 'VERIFIED_LOCAL' ||
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
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt)
  ) {
    throw new Error('답변 응답 형식이 올바르지 않습니다.');
  }
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
    !['OPEN', 'RESOLVED', 'REMOVED', 'EXPIRED'].includes(
      String(value.status),
    ) ||
    (value.safetyNotice !== null && typeof value.safetyNotice !== 'string') ||
    typeof value.answerCount !== 'number' ||
    !Number.isInteger(value.answerCount) ||
    value.answerCount < 0 ||
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
    status: value.status as QuestionStatus,
    safetyNotice: value.safetyNotice,
    answerCount: value.answerCount,
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
  return { ...parseQuestion(value), answers: value.answers.map(parseAnswer) };
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
  cursor?: string,
): Promise<QuestionPage> {
  const query = new URLSearchParams({ status, limit: '20' });
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
