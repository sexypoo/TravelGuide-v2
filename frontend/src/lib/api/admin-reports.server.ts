import 'server-only';

import { fetchProtectedApi } from './protected-server';
import {
  parseAdminReport,
  parseAdminReports,
  type AdminReport,
} from './admin-reports';

export async function getAdminReports(filters: {
  status?: string;
  targetType?: string;
}): Promise<AdminReport[]> {
  const query = new URLSearchParams();
  if (filters.status) query.set('status', filters.status);
  if (filters.targetType) query.set('targetType', filters.targetType);
  const suffix = query.size === 0 ? '' : `?${query.toString()}`;
  const response = await fetchProtectedApi(
    `/api/v1/admin/reports${suffix}`,
    '/admin/reports',
  );
  return parseAdminReports(await response.json());
}

export async function getAdminReport(id: string): Promise<AdminReport> {
  const response = await fetchProtectedApi(
    `/api/v1/admin/reports/${encodeURIComponent(id)}`,
    '/admin/reports',
  );
  return parseAdminReport(await response.json());
}
