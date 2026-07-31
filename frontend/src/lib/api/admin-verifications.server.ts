import 'server-only';

import { fetchProtectedApi } from './protected-server';
import {
  parseAdminVerification,
  parseAdminVerifications,
  type AdminVerification,
} from './admin-verifications';

export async function getAdminVerifications(filters: {
  status?: string;
  type?: string;
}): Promise<AdminVerification[]> {
  const query = new URLSearchParams();
  if (filters.status !== undefined && filters.status !== '')
    query.set('status', filters.status);
  if (filters.type !== undefined && filters.type !== '')
    query.set('type', filters.type);
  const suffix = query.size === 0 ? '' : `?${query.toString()}`;
  const response = await fetchProtectedApi(
    `/api/v1/admin/verifications${suffix}`,
    '/admin',
  );
  return parseAdminVerifications(await response.json());
}

export async function getAdminVerification(
  id: string,
): Promise<AdminVerification> {
  const response = await fetchProtectedApi(
    `/api/v1/admin/verifications/${encodeURIComponent(id)}`,
    '/admin',
  );
  return parseAdminVerification(await response.json());
}
