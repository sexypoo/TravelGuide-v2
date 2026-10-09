import Link from 'next/link';
import { ReportReviewPanel } from '@/components/admin/report-review-panel';
import { AdminFrame } from '@/components/admin/admin-frame';
import {
  reportStatusLabels,
  reportStatusTones,
  reportTargetLabels,
} from '@/components/admin/admin-labels';
import styles from '@/components/admin/admin.module.css';
import { reportReasonLabels } from '@/components/reports/report-reason-labels';
import {
  getAdminReport,
  getAdminReports,
} from '@/lib/api/admin-reports.server';
import { requireAdmin } from '@/lib/auth/session';

interface Props {
  searchParams: Promise<{
    status?: string | string[];
    targetType?: string | string[];
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

export default async function AdminReportsPage({
  searchParams,
}: Props): Promise<React.JSX.Element> {
  const [admin, query] = await Promise.all([requireAdmin(), searchParams]);
  const filters = {
    status: value(query.status),
    targetType: value(query.targetType),
  };
  const selectedId = value(query.selected);
  const [items, selected] = await Promise.all([
    getAdminReports(filters),
    selectedId === '' ? Promise.resolve(null) : getAdminReport(selectedId),
  ]);
  function linkFor(id: string): string {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.targetType) params.set('targetType', filters.targetType);
    params.set('selected', id);
    return `/admin/reports?${params.toString()}`;
  }
  return (
    <AdminFrame
      adminNickname={admin.nickname}
      current="reports"
      title="신고 관리"
      description="신고 대상과 원문을 확인하고 필요한 최소 조치만 선택하세요."
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
            <option value="PENDING">대기</option>
            <option value="REVIEWED">유지</option>
            <option value="RESOLVED">숨김 완료</option>
            <option value="DISMISSED">기각</option>
          </select>
        </label>
        <label>
          대상
          <select
            className={styles.select}
            name="targetType"
            defaultValue={filters.targetType}
          >
            <option value="">전체 대상</option>
            <option value="QUESTION">토픽</option>
            <option value="ANSWER">답변</option>
            <option value="COMMUNITY_POST">커뮤니티 글</option>
            <option value="COMMUNITY_COMMENT">커뮤니티 댓글</option>
            <option value="USER">사용자</option>
          </select>
        </label>
        <button className={styles.button}>필터 적용</button>
      </form>
      <div className={styles.review}>
        <section className={styles.queue} aria-label="신고 목록">
          <p className={styles.queueHeading}>
            <strong>{items.length}건</strong>
            <span>최신 접수순</span>
          </p>
          {items.length === 0 ? (
            <p className={styles.empty}>조건에 맞는 신고가 없습니다.</p>
          ) : (
            <ul className={styles.queueList}>
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    className={styles.queueItem}
                    aria-current={selectedId === item.id ? 'true' : undefined}
                    href={linkFor(item.id)}
                  >
                    <strong>{item.target.author.nickname}</strong>
                    <span
                      className={styles.status}
                      data-tone={reportStatusTones[item.status]}
                    >
                      {reportStatusLabels[item.status]}
                    </span>
                    <small>
                      {reportTargetLabels[item.targetType]},{' '}
                      {reportReasonLabels[item.reason]} ·{' '}
                      {shortDate(item.createdAt)} 접수
                    </small>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        {selected === null ? (
          <section className={styles.placeholder}>
            <h2>검토할 신고를 선택하세요</h2>
            <p>신고만으로 콘텐츠를 자동 숨기지 않습니다.</p>
          </section>
        ) : (
          <ReportReviewPanel report={selected} />
        )}
      </div>
    </AdminFrame>
  );
}
