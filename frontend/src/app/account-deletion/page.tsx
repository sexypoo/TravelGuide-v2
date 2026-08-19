import Link from 'next/link';
import { LegalShell } from '@/components/legal/legal-shell';

export const metadata = {
  title: '계정 삭제 안내',
  description: '여쭈어 계정과 연결된 개인정보를 영구 삭제하는 방법',
};

export default async function AccountDeletionPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}): Promise<React.JSX.Element> {
  const deleted = (await searchParams).deleted === 'true';
  return (
    <LegalShell
      eyebrow="ACCOUNT DELETION"
      title={deleted ? '계정 삭제가 완료되었습니다.' : '여쭈어 계정 삭제'}
      description={
        deleted
          ? '계정과 연결된 데이터의 삭제 요청을 처리했습니다.'
          : '앱이 없어도 웹에서 로그인해 본인 계정을 직접 삭제할 수 있습니다.'
      }
    >
      {deleted ? (
        <section className="legalDocument__complete" role="status">
          <strong>삭제된 계정은 복구할 수 없습니다.</strong>
          <p>다시 이용하려면 새로운 계정을 만들어 주세요.</p>
          <Link href="/">홈으로 돌아가기</Link>
        </section>
      ) : (
        <>
          <section>
            <h2>삭제 방법</h2>
            <ol className="deletionSteps">
              <li>
                <span>01</span>
                <div>
                  <strong>웹 또는 앱에서 로그인</strong>
                  <p>삭제할 계정의 소유자임을 먼저 확인합니다.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>프로필 → 계정 관리</strong>
                  <p>계정 삭제 살펴보기를 선택합니다.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>본인 확인 후 영구 삭제</strong>
                  <p>
                    비밀번호 계정은 현재 비밀번호를 입력하고, 모든 계정은 확인
                    문구를 입력합니다.
                  </p>
                </div>
              </li>
            </ol>
            <Link
              className="legalDocument__primary"
              href="/auth/login?next=%2Fapp%2Fprofile"
            >
              로그인하고 계정 삭제하기
            </Link>
          </section>

          <section>
            <h2>함께 삭제되는 항목</h2>
            <div className="deletionRoute" aria-label="계정 삭제 범위">
              <span>계정</span>
              <i aria-hidden="true">→</i>
              <span>공개 콘텐츠</span>
              <i aria-hidden="true">→</i>
              <span>비공개 증빙·업로드</span>
            </div>
            <p>
              프로필, 로그인 연결, 여행·인증 기록, 질문·답변·채팅·커뮤니티
              게시물, 찜한 장소, 동일 이메일의 사전예약 정보와 관련 비공개
              파일을 삭제합니다. 다른 콘텐츠에서 계정 삭제로 함께 사라지는
              답변·댓글의 신고 기록도 정리합니다.
            </p>
          </section>

          <section>
            <h2>처리 시점과 주의사항</h2>
            <p>
              확인을 마치면 운영 데이터베이스에서 즉시 삭제를 시작하며, 완료된
              계정은 복구할 수 없습니다. Sign in with Apple 계정은 Apple 연결
              해제를 먼저 처리합니다. 소유권 확인을 위해 로그인은 필요하지만
              모바일 앱 설치는 필요하지 않습니다.
            </p>
          </section>
        </>
      )}
    </LegalShell>
  );
}
