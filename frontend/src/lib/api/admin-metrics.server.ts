import 'server-only';

import { fetchProtectedApi } from './protected-server';
import { parseAdminMetrics, type AdminMetrics } from './admin-metrics';

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const response = await fetchProtectedApi(
    '/api/v1/admin/metrics',
    '/admin/metrics',
  );
  return parseAdminMetrics(await response.json());
}
