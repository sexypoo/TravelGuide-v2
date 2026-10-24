import { render, screen, within } from '@testing-library/react';
import type { Verification } from '@/lib/api/verifications';
import { VerificationStatusCard } from './verification-status-card';

const base: Verification = {
  id: 'verification-1',
  destination: { id: 'destination-1', slug: 'jeju', nameKo: '제주' },
  type: 'TRAVELER',
  status: 'PENDING',
  startsAt: '2026-08-01T00:00:00.000Z',
  endsAt: '2026-08-05T00:00:00.000Z',
  localProofType: null,
  note: null,
  reviewedAt: null,
  rejectionReason: null,
  expiresAt: null,
  createdAt: '2026-07-20T00:00:00.000Z',
};

const local: Verification = {
  ...base,
  id: 'verification-2',
  type: 'LOCAL',
  startsAt: null,
  endsAt: null,
  localProofType: 'RESIDENCE',
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

function steps(): HTMLElement[] {
  return within(
    screen.getByRole('list', { name: '인증 진행 상태' }),
  ).getAllByRole('listitem');
}

describe('VerificationStatusCard (VER-003)', () => {
  it.each([
    ['TRAVELER', base, '/app/verifications/traveler'],
    ['LOCAL', local, '/app/verifications/local'],
  ] as const)(
    'shows the rejection reason and a %s reapply link',
    (_type, verification, href) => {
      render(
        <VerificationStatusCard
          verification={{
            ...verification,
            status: 'REJECTED',
            rejectionReason: '예약 확인서의 날짜가 보이지 않아요.',
          }}
          canReapply
        />,
      );

      expect(screen.getByText('반려됨')).toBeInTheDocument();
      expect(screen.getByText('다시 확인할 내용')).toBeInTheDocument();
      expect(
        screen.getByText('예약 확인서의 날짜가 보이지 않아요.'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: '새로 신청하기' }),
      ).toHaveAttribute('href', href);
    },
  );

  it('keeps the reason but hides reapply while the same type is pending', () => {
    render(
      <VerificationStatusCard
        verification={{
          ...base,
          status: 'REJECTED',
          rejectionReason: '예약 확인서의 날짜가 보이지 않아요.',
        }}
        canReapply={false}
      />,
    );

    expect(
      screen.getByText('예약 확인서의 날짜가 보이지 않아요.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '새로 신청하기' }),
    ).not.toBeInTheDocument();
  });

  it('renders the rejection reason as text, not markup', () => {
    const { container } = render(
      <VerificationStatusCard
        verification={{
          ...base,
          status: 'REJECTED',
          rejectionReason: '<b>굵게</b> 다시 올려 주세요',
        }}
        canReapply
      />,
    );

    expect(
      screen.getByText('<b>굵게</b> 다시 올려 주세요'),
    ).toBeInTheDocument();
    expect(container.querySelector('b')).toBeNull();
  });

  it('shows the trip dates for an approved traveler', () => {
    render(
      <VerificationStatusCard
        verification={{ ...base, status: 'APPROVED' }}
        canReapply
      />,
    );

    expect(screen.getByText('승인 완료')).toBeInTheDocument();
    expect(
      screen.getByText(
        `${formatDate('2026-08-01T00:00:00.000Z')} – ${formatDate(
          '2026-08-05T00:00:00.000Z',
        )}`,
      ),
    ).toBeInTheDocument();
  });

  it('shows the expiry date for an approved local', () => {
    render(
      <VerificationStatusCard
        verification={{
          ...local,
          status: 'APPROVED',
          expiresAt: '2026-10-30T00:00:00.000Z',
        }}
        canReapply
      />,
    );

    expect(
      screen.getByText(`${formatDate('2026-10-30T00:00:00.000Z')}까지 유효`),
    ).toBeInTheDocument();
  });

  it('explains the 90-day validity for a pending local without expiry', () => {
    render(<VerificationStatusCard verification={local} canReapply={false} />);

    expect(screen.getByText('심사 중')).toBeInTheDocument();
    expect(screen.getByText('승인 후 90일 동안 유효')).toBeInTheDocument();
  });

  it('points a revoked user to support without a reapply link', () => {
    render(
      <VerificationStatusCard
        verification={{ ...local, status: 'REVOKED' }}
        canReapply
      />,
    );

    expect(screen.getByText('자격 회수')).toBeInTheDocument();
    expect(
      screen.getByText('자격 관련 문의는 운영팀에 알려 주세요.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '새로 신청하기' }),
    ).not.toBeInTheDocument();
  });

  it('marks review as the current step while pending', () => {
    render(<VerificationStatusCard verification={base} canReapply={false} />);

    const [submitted, review, joined] = steps();
    expect(submitted).not.toHaveAttribute('aria-current');
    expect(submitted).toHaveAttribute('data-state', 'done');
    expect(review).toHaveAttribute('aria-current', 'step');
    expect(review).toHaveTextContent('심사');
    expect(joined).toHaveAttribute('data-state', 'upcoming');
  });

  it('completes every step once approved', () => {
    render(
      <VerificationStatusCard
        verification={{ ...base, status: 'APPROVED' }}
        canReapply
      />,
    );

    for (const step of steps()) {
      expect(step).not.toHaveAttribute('aria-current');
      expect(step).toHaveAttribute('data-state', 'done');
    }
  });
});
