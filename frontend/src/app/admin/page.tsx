import Link from 'next/link';
import { VerificationReviewPanel } from '@/components/admin/verification-review-panel';
import { LogoutButton } from '@/components/auth/logout-button';
import { Wordmark } from '@/components/brand/wordmark';
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
          <h1>인증 심사</h1>
          <span>
            신청 내용과 비공개 증빙을 확인한 뒤 참여 자격을 결정하세요.
          </span>
        </header>
        <nav className="adminTabs" aria-label="관리자 메뉴">
          <span aria-current="page">인증 심사</span>
          <span aria-disabled="true">신고 관리 · 준비 중</span>
        </nav>
        <form className="adminFilters" method="get">
          <label>
            상태
            <select name="status" defaultValue={filters.status}>
              <option value="">전체 상태</option>
              <option value="PENDING">심사 중</option>
              <option value="APPROVED">승인</option>
              <option value="REJECTED">반려</option>
            </select>
          </label>
          <label>
            유형
            <select name="type" defaultValue={filters.type}>
              <option value="">전체 유형</option>
              <option value="TRAVELER">여행자</option>
              <option value="LOCAL">현지인</option>
            </select>
          </label>
          <button>필터 적용</button>
        </form>
        <div className="adminReviewGrid">
          <section className="applicationList" aria-label="인증 신청 목록">
            <div className="applicationList__count">
              <strong>{items.length}건</strong>
              <span>최신 제출순</span>
            </div>
            {items.length === 0 ? (
              <div className="adminEmpty">조건에 맞는 신청이 없습니다.</div>
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
                  <strong>{item.applicant.nickname}</strong>
                  <p>
                    {item.destination.nameKo} ·{' '}
                    {item.type === 'TRAVELER' ? '여행자' : '현지인'}
                  </p>
                  <small>{shortDate(item.createdAt)} 제출</small>
                </Link>
              ))
            )}
          </section>
          {selected === null ? (
            <section className="reviewPlaceholder">
              <span>↖</span>
              <h2>검토할 신청을 선택하세요</h2>
              <p>증빙은 선택 후 명시적으로 열 때만 불러옵니다.</p>
            </section>
          ) : (
            <VerificationReviewPanel verification={selected} />
          )}
        </div>
      </div>
    </main>
  );
}
