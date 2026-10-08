import type { ReportReason } from '@/lib/api/reports';

export const reportReasonLabels: Readonly<Record<ReportReason, string>> = {
  SPAM: '도배·스팸',
  ABUSE: '욕설·괴롭힘',
  FALSE_INFORMATION: '잘못된 정보',
  ADVERTISEMENT: '광고·홍보',
  PRIVACY: '개인정보 노출',
  SAFETY: '안전 위험',
  OTHER: '기타',
};
