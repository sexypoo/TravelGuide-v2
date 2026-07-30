import { requireUser } from '@/lib/auth/session';

export default async function AppHome(): Promise<React.JSX.Element> {
  const user = await requireUser('/app');

  return (
    <section className="sessionHome" aria-labelledby="welcome-title">
      <p className="sessionHome__eyebrow">로그인 완료</p>
      <h1 id="welcome-title">{user.nickname}님, 반가워요.</h1>
      <p>
        안전한 세션으로 연결되었습니다. 제주 방과 인증 현황은 다음 프론트엔드
        작업에서 실제 API와 함께 이곳에 추가됩니다.
      </p>
      <div className="sessionCard">
        <span className="sessionCard__icon" aria-hidden="true">
          ✓
        </span>
        <div>
          <strong>계정 연결됨</strong>
          <p>브라우저에 토큰을 노출하지 않는 보안 쿠키를 사용하고 있어요.</p>
        </div>
      </div>
    </section>
  );
}
