import type { Verification } from '@/lib/api/verifications';
import { getQualificationPresentation } from './presentation';

function verification(
  type: Verification['type'],
  status: Verification['status'],
): Verification {
  return {
    id: `${type}-${status}`,
    destination: { id: 'jeju', slug: 'jeju', nameKo: '제주' },
    type,
    status,
    startsAt: null,
    endsAt: null,
    localProofType: null,
    note: null,
    reviewedAt: null,
    rejectionReason: null,
    expiresAt: null,
    createdAt: '2026-08-15T00:00:00.000Z',
  };
}

describe('qualification presentation', () => {
  it('shows status instead of reapplication for an approved type', () => {
    expect(
      getQualificationPresentation(
        [verification('TRAVELER', 'APPROVED')],
        'TRAVELER',
      ),
    ).toMatchObject({
      title: '제주 여행자 인증 완료',
      action: '인증 현황 보기',
      href: '/app/verifications',
      className: 'qualificationApproved',
    });
  });

  it('prioritizes approval and keeps the other type available', () => {
    const verifications = [
      verification('TRAVELER', 'PENDING'),
      verification('TRAVELER', 'APPROVED'),
    ];

    expect(getQualificationPresentation(verifications, 'TRAVELER').title).toBe(
      '제주 여행자 인증 완료',
    );
    expect(getQualificationPresentation(verifications, 'LOCAL')).toMatchObject({
      title: '제주에 살고 있나요?',
      href: '/app/verifications/local',
    });
  });
});
