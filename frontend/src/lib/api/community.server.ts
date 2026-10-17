import 'server-only';

import { parseCommunityPost, type CommunityPost } from './community';
import { fetchProtectedApi } from './protected-server';
import { isRecord } from './runtime';

export async function getRecentCommunityPosts(
  limit = 3,
): Promise<CommunityPost[]> {
  const response = await fetchProtectedApi(
    `/api/v1/community/posts?limit=${limit}`,
    '/app',
  );
  const value: unknown = await response.json();
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new Error('커뮤니티 목록 응답 형식이 올바르지 않습니다.');
  }
  return value.items.map(parseCommunityPost);
}
