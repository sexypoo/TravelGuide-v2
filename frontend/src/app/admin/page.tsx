import Link from 'next/link';
import { VerificationReviewPanel } from '@/components/admin/verification-review-panel';
import { AdminFrame } from '@/components/admin/admin-frame';
import {
  verificationStatusLabels,
  statusChipTones,
  verificationStatusTones,
  verificationTypeLabels,
} from '@/components/admin/admin-labels';
import styles from '@/components/admin/admin.module.css';
import { Button, Card, Chip, EmptyState } from '@/components/ui';
import {
  getAdminVerification,
  getAdminVerifications,
} from '@/lib/api/admin-verifications.server';
import { requireAdmin } from '@/lib/auth/session';

interface AdminPageProps {
  searchParams: Promise<{
    status?: string | string[];
    type?: string | string[];
    selected?: string | string[];
  }>;
}

function value(input: string | string[] | undefined): string {
  return typeof input === 'string' ? input : '';
}
function shortDate(input: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(input));
}

export default async function AdminPage({
  searchParams,
}: AdminPageProps): Promise<React.JSX.Element> {
  const [admin, query] = await Promise.all([requireAdmin(), searchParams]);
  const filters = { status: value(query.status), type: value(query.type) };
  const selectedId = value(query.selected);
  const [items, selected] = await Promise.all([
    getAdminVerifications(filters),
    selectedId === ''
      ? Promise.resolve(null)
      : getAdminVerification(selectedId),
  ]);
  const linkFor = (id: string): string => {
    const params = new URLSearchParams();
    if (filters.status !== '') params.set('status', filters.status);
    if (filters.type !== '') params.set('type', filters.type);
    params.set('selected', id);
    return `/admin?${params.toString()}`;
  };

  return (
    <AdminFrame
      adminNickname={admin.nickname}
      current="verifications"
      title="인증 심사"
      description="신청 내용과 비공개 증빙을 확인한 뒤 참여 자격을 결정하세요."
    >
      <form className={styles.filters} method="get">
        <label>
          상태
          <select
            className={styles.select}
            name="status"
            defaultValue={filters.status}
          >
            <option value="">전체 상태</option>
            <option value="PENDING">심사 중</option>
            <option value="APPROVED">승인</option>
            <option value="REJECTED">반려</option>
          </select>
        </label>
        <label>
          유형
          <select
            className={styles.select}
            name="type"
            defaultValue={filters.type}
          >
            <option value="">전체 유형</option>
            <option value="TRAVELER">여행자</option>
            <option value="LOCAL">현지인</option>
          </select>
        </label>
        <Button type="submit" variant="dark">
          필터 적용
        </Button>
      </form>
      <div className={styles.review}>
        <Card
          padding="none"
          className={styles.queue}
          aria-label="인증 신청 목록"
        >
          <p className={styles.queueHeading}>
            <strong>{items.length}건</strong>
            <span>최신 제출순</span>
          </p>
          {items.length === 0 ? (
            <EmptyState
              icon="search"
              title="조건에 맞는 신청이 없습니다."
              description="필터를 바꾸거나 전체 상태로 다시 확인해 보세요."
            />
          ) : (
            <ul className={styles.queueList}>
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    className={styles.queueItem}
                    aria-current={selectedId === item.id ? 'true' : undefined}
                    href={linkFor(item.id)}
                  >
                    <strong>{item.applicant.nickname}</strong>
                    <Chip
                      tone={
                        statusChipTones[verificationStatusTones[item.status]]
                      }
                    >
                      {verificationStatusLabels[item.status]}
                    </Chip>
                    <small>
                      {item.destination.nameKo}{' '}
                      {verificationTypeLabels[item.type]} ·{' '}
                      {shortDate(item.createdAt)} 제출
                    </small>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        {selected === null ? (
          <Card className={styles.placeholder}>
            <EmptyState
              icon="info"
              title="검토할 신청을 선택하세요"
              description="증빙은 선택 후 직접 열 때만 불러옵니다."
            />
          </Card>
        ) : (
          <VerificationReviewPanel verification={selected} />
        )}
      </div>
    </AdminFrame>
  );
}
