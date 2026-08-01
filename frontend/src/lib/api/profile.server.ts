import 'server-only';

import {
  parseOwnProfile,
  parsePublicContributorProfile,
  type OwnProfile,
  type PublicContributorProfile,
} from './profile';
import { fetchProtectedApi } from './protected-server';

export async function getOwnProfile(): Promise<OwnProfile> {
  const response = await fetchProtectedApi('/api/v1/users/me', '/app/profile');
  return parseOwnProfile(await response.json());
}

export async function getPublicContributorProfile(
  userId: string,
): Promise<PublicContributorProfile> {
  const nextPath = `/app/users/${encodeURIComponent(userId)}`;
  const response = await fetchProtectedApi(
    `/api/v1/users/${encodeURIComponent(userId)}/public`,
    nextPath,
  );
  return parsePublicContributorProfile(await response.json());
}
