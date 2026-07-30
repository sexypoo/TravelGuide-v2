import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';
import { Wordmark } from '@/components/brand/wordmark';
import { requireAdmin } from '@/lib/auth/session';

export default async function AdminPage(): Promise<React.JSX.Element> {
  const admin = await requireAdmin();

  return (
    <main className="adminShell">
      <header className="adminHeader">
        <Wordmark />
        <div>
          <span>{admin.nickname} 관리자</span>
          <LogoutButton />
        </div>
      </header>
      <section className="adminPlaceholder">
        <p>관리자 세션</p>
        <h1>관리자 권한이 확인되었습니다.</h1>
        <span>
          인증 심사와 신고 관리 기능은 해당 백엔드·프론트엔드 작업에서
          연결됩니다.
        </span>
        <Link href="/app">사용자 홈으로 이동</Link>
      </section>
    </main>
  );
}
