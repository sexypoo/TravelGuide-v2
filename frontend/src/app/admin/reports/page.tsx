import Link from 'next/link';
import { ReportReviewPanel } from '@/components/admin/report-review-panel';
import { LogoutButton } from '@/components/auth/logout-button';
import { Wordmark } from '@/components/brand/wordmark';
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
    <main className="adminShell">
      <header className="adminHeader">
        <Wordmark />
        <div>
          <span>{admin.nickname} 관리자</span>
          <Link href="/app">사용자 화면</Link>
          <LogoutButton />
        </div>
      </header>
      <div className="adminWorkspace">
        <header className="adminWorkspace__heading">
          <p>TRUST DESK</p>
          <h1>신고 관리</h1>
          <span>
            신고 대상과 원문을 확인하고 필요한 최소 조치만 선택하세요.
          </span>
        </header>
        <nav className="adminTabs" aria-label="관리자 메뉴">
          <Link href="/admin">인증 심사</Link>
          <span aria-current="page">신고 관리</span>
          <Link href="/admin/metrics">서비스 지표</Link>
        </nav>
        <form className="adminFilters" method="get">
          <label>
            상태
            <select name="status" defaultValue={filters.status}>
              <option value="">전체 상태</option>
              <option value="PENDING">대기</option>
              <option value="REVIEWED">유지</option>
              <option value="RESOLVED">숨김 완료</option>
              <option value="DISMISSED">기각</option>
            </select>
          </label>
          <label>
            대상
            <select name="targetType" defaultValue={filters.targetType}>
              <option value="">전체 대상</option>
              <option value="QUESTION">토픽</option>
              <option value="ANSWER">답변</option>
              <option value="COMMUNITY_POST">커뮤니티 글</option>
              <option value="COMMUNITY_COMMENT">커뮤니티 댓글</option>
              <option value="USER">사용자</option>
            </select>
          </label>
          <button>필터 적용</button>
        </form>
        <div className="adminReviewGrid">
          <section
            className="applicationList reportList"
            aria-label="신고 목록"
          >
            <div className="applicationList__count">
              <strong>{items.length}건</strong>
              <span>최신 접수순</span>
            </div>
            {items.length === 0 ? (
              <div className="adminEmpty">조건에 맞는 신고가 없습니다.</div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  className={selectedId === item.id ? 'isSelected' : undefined}
                  href={linkFor(item.id)}
                >
                  <span
                    className={`adminStatus adminStatus--${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                  <strong>{item.target.author.nickname}</strong>
                  <p>
                    {item.targetType} · {item.reason}
                  </p>
                  <small>{shortDate(item.createdAt)} 접수</small>
                </Link>
              ))
            )}
          </section>
          {selected === null ? (
            <section className="reviewPlaceholder">
              <span>↖</span>
              <h2>검토할 신고를 선택하세요</h2>
              <p>신고만으로 콘텐츠를 자동 숨기지 않습니다.</p>
            </section>
          ) : (
            <ReportReviewPanel report={selected} />
          )}
        </div>
      </div>
    </main>
  );
}
