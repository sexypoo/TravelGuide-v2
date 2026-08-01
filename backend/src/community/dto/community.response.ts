import type { CommunityPostCategory } from '@prisma/client';

export interface CommunityAuthorResponse {
  id: string;
  nickname: string;
}

export interface CommunityCommentResponse {
  id: string;
  postId: string;
  author: CommunityAuthorResponse;
  content: string;
  removed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostResponse {
  id: string;
  author: CommunityAuthorResponse;
  category: CommunityPostCategory;
  areaText: string | null;
  title: string;
  content: string;
  removed: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostDetailResponse extends CommunityPostResponse {
  comments: CommunityCommentResponse[];
}

export interface CommunityPostPageResponse {
  items: CommunityPostResponse[];
  nextCursor: string | null;
}
