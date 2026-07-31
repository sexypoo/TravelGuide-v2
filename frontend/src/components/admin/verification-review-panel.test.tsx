import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AdminVerification } from '@/lib/api/admin-verifications';
import { VerificationReviewPanel } from './verification-review-panel';

const refreshMock = jest.fn();
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const verification: AdminVerification = {
  id: 'verification-1',
  applicant: { id: 'user-1', nickname: '제주여행자' },
  destination: { id: 'destination-jeju', slug: 'jeju', nameKo: '제주' },
  type: 'TRAVELER',
  status: 'PENDING',
  startsAt: '2026-08-01T00:00:00.000Z',
  endsAt: '2026-08-03T00:00:00.000Z',
  localProofType: null,
  gpsSummary: null,
  note: '항공권과 숙소 예약 내역입니다.',
  reviewedById: null,
  reviewedAt: null,
  rejectionReason: null,
  expiresAt: null,
  createdAt: '2026-07-31T10:00:00.000Z',
};

describe('VerificationReviewPanel', () => {
  beforeEach(() => {
    refreshMock.mockReset();
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });
  });

  it('requires confirmation before approving and refreshes after success', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 } as Response);
    render(<VerificationReviewPanel verification={verification} />);
    fireEvent.click(screen.getByRole('button', { name: '승인 검토' }));
    expect(screen.getByText('이 신청을 승인할까요?')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '승인 확정' }));
    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/verifications/verification-1/review',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ decision: 'APPROVE', reason: null }),
      }),
    );
  });

  it('does not reject without a ten-character reason', () => {
    render(<VerificationReviewPanel verification={verification} />);
    fireEvent.click(screen.getByRole('button', { name: '반려 검토' }));
    fireEvent.click(screen.getByRole('button', { name: '반려 확정' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      '반려 사유를 10자 이상',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
