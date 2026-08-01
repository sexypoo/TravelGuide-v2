import { problemFromResponse } from './problem-details';

export const communityCategories = [
  'TRAVEL_TIP',
  'TRANSPORT',
  'FOOD',
  'PLACE',
  'QUESTION',
  'OTHER',
] as const;
export type CommunityCategory = (typeof communityCategories)[number];

export interface CommunityAuthor {
  id: string;
  nickname: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  author: CommunityAuthor;
  content: string;
  removed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  id: string;
  author: CommunityAuthor;
  category: CommunityCategory;
  areaText: string | null;
  title: string;
  content: string;
  removed: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostDetail extends CommunityPost {
  comments: CommunityComment[];
}

export interface CommunityPage {
  items: CommunityPost[];
  nextCursor: string | null;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function author(value: unknown): CommunityAuthor {
  if (
    !record(value) ||
    typeof value.id !== 'string' ||
    typeof value.nickname !== 'string'
  )
    throw new Error('커뮤니티 작성자 응답 형식이 올바르지 않습니다.');
  return { id: value.id, nickname: value.nickname };
}

export function parseCommunityPost(value: unknown): CommunityPost {
  if (
    !record(value) ||
    typeof value.id !== 'string' ||
    !communityCategories.includes(value.category as CommunityCategory) ||
    (value.areaText !== null && typeof value.areaText !== 'string') ||
    typeof value.title !== 'string' ||
    typeof value.content !== 'string' ||
    typeof value.removed !== 'boolean' ||
    typeof value.commentCount !== 'number' ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string'
  )
    throw new Error('커뮤니티 게시글 응답 형식이 올바르지 않습니다.');
  return {
    id: value.id,
    author: author(value.author),
    category: value.category as CommunityCategory,
    areaText: value.areaText,
    title: value.title,
    content: value.content,
    removed: value.removed,
    commentCount: value.commentCount,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function parseComment(value: unknown): CommunityComment {
  if (
    !record(value) ||
    typeof value.id !== 'string' ||
    typeof value.postId !== 'string' ||
    typeof value.content !== 'string' ||
    typeof value.removed !== 'boolean' ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string'
  )
    throw new Error('커뮤니티 댓글 응답 형식이 올바르지 않습니다.');
  return {
    id: value.id,
    postId: value.postId,
    author: author(value.author),
    content: value.content,
    removed: value.removed,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export async function getCommunityPage(
  category?: CommunityCategory,
  cursor?: string,
): Promise<CommunityPage> {
  const search = new URLSearchParams({ limit: '20' });
  if (category !== undefined) search.set('category', category);
  if (cursor !== undefined) search.set('cursor', cursor);
  const response = await fetch(`/api/v1/community/posts?${search}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw await problemFromResponse(response);
  const value: unknown = await response.json();
  if (
    !record(value) ||
    !Array.isArray(value.items) ||
    (value.nextCursor !== null && typeof value.nextCursor !== 'string')
  ) {
    throw new Error('커뮤니티 목록 응답 형식이 올바르지 않습니다.');
  }
  return {
    items: value.items.map(parseCommunityPost),
    nextCursor: value.nextCursor,
  };
}

export async function createCommunityPost(input: {
  category: CommunityCategory;
  areaText?: string;
  title: string;
  content: string;
}): Promise<CommunityPost> {
  const response = await fetch('/api/v1/community/posts', {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await problemFromResponse(response);
  return parseCommunityPost(await response.json());
}

export async function getCommunityPost(
  id: string,
): Promise<CommunityPostDetail> {
  const response = await fetch(
    `/api/v1/community/posts/${encodeURIComponent(id)}`,
    {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    },
  );
  if (!response.ok) throw await problemFromResponse(response);
  const value: unknown = await response.json();
  if (!record(value) || !Array.isArray(value.comments)) {
    throw new Error('커뮤니티 상세 응답 형식이 올바르지 않습니다.');
  }
  return {
    ...parseCommunityPost(value),
    comments: value.comments.map(parseComment),
  };
}

export async function createCommunityComment(
  postId: string,
  content: string,
): Promise<CommunityComment> {
  const response = await fetch(
    `/api/v1/community/posts/${encodeURIComponent(postId)}/comments`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    },
  );
  if (!response.ok) throw await problemFromResponse(response);
  return parseComment(await response.json());
}
