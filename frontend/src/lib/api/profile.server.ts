import 'server-only';

import { parseOwnProfile, type OwnProfile } from './profile';
import { fetchProtectedApi } from './protected-server';

export async function getOwnProfile(): Promise<OwnProfile> {
  const response = await fetchProtectedApi('/api/v1/users/me', '/app/profile');
  return parseOwnProfile(await response.json());
}
