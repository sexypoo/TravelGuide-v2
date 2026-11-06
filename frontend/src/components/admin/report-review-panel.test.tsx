import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AdminReport } from '@/lib/api/admin-reports';
import { ReportReviewPanel } from './report-review-panel';

const refreshMock = jest.fn();
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const report: AdminReport = {
  id: 'report-1',
  reporter: { id: 'user-1', nickname: '신고자' },
  targetType: 'MESSAGE',
  targetId: 'message-1',
  target: {
    author: { id: 'user-2', nickname: '작성자' },
    content: '광고 메시지입니다.',
    removed: false,
    roomSlug: 'jeju',
    questionId: null,
  },
  reason: 'ADVERTISEMENT',
  detail: null,
  status: 'PENDING',
  reviewedBy: null,
  reviewedAt: null,
  resolutionNote: null,
  createdAt: '2026-07-31T10:00:00.000Z',
  updatedAt: '2026-07-31T10:00:00.000Z',
};

describe('ReportReviewPanel', () => {
  beforeEach(() => {
    refreshMock.mockReset();
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });
  });

  it('starts fresh when another report is selected', () => {
    const { rerender } = render(<ReportReviewPanel report={report} />);
    fireEvent.click(screen.getByRole('button', { name: '숨김 검토' }));
    fireEvent.change(screen.getByLabelText('처리 근거 메모'), {
      target: { value: '첫 번째 신고를 위한 메모' },
    });
    rerender(<ReportReviewPanel report={{ ...report, id: 'report-2' }} />);
    expect(screen.getByRole('button', { name: '유지 검토' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '숨김 검토' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '기각 검토' })).toBeEnabled();
    expect(screen.queryByLabelText('처리 근거 메모')).not.toBeInTheDocument();
    expect(
      screen.queryByText('콘텐츠 숨김으로 처리할까요?'),
    ).not.toBeInTheDocument();
  });

  it('lets the next report be resolved after one succeeds', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 } as Response);
    const { rerender } = render(<ReportReviewPanel report={report} />);
    fireEvent.click(screen.getByRole('button', { name: '숨김 검토' }));
    fireEvent.click(screen.getByRole('button', { name: '콘텐츠 숨김 확정' }));
    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/reports/report-1/review',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ decision: 'REMOVE' }),
      }),
    );
    rerender(<ReportReviewPanel report={{ ...report, id: 'report-2' }} />);
    fireEvent.click(screen.getByRole('button', { name: '기각 검토' }));
    const confirmButton = screen.getByRole('button', {
      name: '신고 기각 확정',
    });
    expect(confirmButton).toBeEnabled();
    fireEvent.click(confirmButton);
    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/v1/admin/reports/report-2/review',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ decision: 'DISMISS' }),
      }),
    );
  });
});
