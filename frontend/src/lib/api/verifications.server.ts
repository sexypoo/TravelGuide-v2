import 'server-only';

import { fetchProtectedApi } from './protected-server';
import { parseVerifications, type Verification } from './verifications';

export async function getMyVerifications(): Promise<Verification[]> {
  const response = await fetchProtectedApi(
    '/api/v1/verifications/me',
    '/app/verifications',
  );
  return parseVerifications(await response.json());
}
