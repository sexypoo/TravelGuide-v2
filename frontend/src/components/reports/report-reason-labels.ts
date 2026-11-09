import { chat } from '@/i18n/messages/ko/chat';
import type { ReportReason } from '@/lib/api/reports';

/** Korean labels for the admin screens; user screens read `chat.report.reasons`. */
export const reportReasonLabels: Readonly<Record<ReportReason, string>> =
  chat.report.reasons;
