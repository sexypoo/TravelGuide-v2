import Link from 'next/link';
import { LegalShell } from '@/components/legal/legal-shell';

export const metadata = {
  title: '개인정보 처리방침',
  description: '여쭈어 서비스의 개인정보 수집, 이용, 보관 및 삭제 안내',
};

export default function PrivacyPage(): React.JSX.Element {
  return (
    <LegalShell
      eyebrow="PRIVACY LEDGER · 2026. 08. 20"
      title="개인정보 처리방침"
      description="여쭈어는 여행 도움방 운영에 필요한 정보만 처리하고, 위치·인증 증빙을 공개 프로필과 분리합니다."
    >
      <section>
        <h2>1. 처리하는 정보</h2>
        <dl className="privacyLedger">
          <div>
            <dt>계정·프로필</dt>
            <dd>
              이메일, 암호화된 비밀번호, 닉네임, 소개, 여행 스타일, 프로필 사진,
              소셜 로그인 제공자 식별자
            </dd>
          </div>
          <div>
            <dt>인증·위치</dt>
            <dd>
              여행 일정 또는 현지인 증빙 파일, 제주 범위 확인용 GPS
              좌표·정확도·촬영 시각, 심사 상태와 사유
            </dd>
          </div>
          <div>
            <dt>서비스 활동</dt>
            <dd>
              질문, 답변, 채팅, 커뮤니티 게시물·댓글, 신고, 찜한 장소, 여행
              기록과 첨부 이미지
            </dd>
          </div>
          <div>
            <dt>신청 정보</dt>
            <dd>사전예약 이름, 이메일, 동의 시각</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2>2. 이용 목적과 공개 범위</h2>
        <p>
          계정 인증, 프로필 표시, 제주 도움방 권한 판정, 실시간 질문·답변과
          커뮤니티 운영, 신고 처리, 저장 기능 및 보안에 사용합니다. 닉네임과
          사용자가 게시한 콘텐츠는 다른 이용자에게 보일 수 있습니다. 이메일,
          비밀번호, 정확한 GPS 좌표와 원본 인증 증빙은 공개 응답으로 제공하지
          않으며 권한 있는 심사 흐름에서만 접근합니다.
        </p>
      </section>

      <section>
        <h2>3. 보관과 삭제</h2>
        <p>
          계정 정보와 서비스 활동은 계정 유지 기간 동안 보관합니다. 비밀번호
          재설정 링크는 30분 동안만 유효합니다. 계정 삭제가 완료되면 계정과
          연결된 공개 콘텐츠, 인증·여행 기록, 신고, 동일 이메일의 사전예약 정보
          및 비공개 파일을 삭제합니다. 현재 서비스에는 계정 삭제 후 별도 법정
          보존 대상으로 설정된 항목이 없습니다.
        </p>
        <Link className="legalDocument__inline" href="/account-deletion">
          계정 삭제 범위와 방법 자세히 보기
        </Link>
      </section>

      <section>
        <h2>4. 외부 서비스와 처리 인프라</h2>
        <p>
          서비스 제공을 위해 배포·데이터베이스·비공개 파일 저장 인프라를
          사용합니다. 설정된 기능에 한해 Google·Kakao·Apple 로그인, Google
          Places/Maps, Resend 이메일 전송과 통신할 수 있습니다. 소셜 로그인
          제공자가 전달한 정보는 계정 연결에 필요한 범위에서만 저장하며, Apple
          refresh token은 암호화해 보관하고 계정 삭제 때 폐기합니다.
        </p>
      </section>

      <section>
        <h2>5. 이용자의 선택과 문의</h2>
        <p>
          프로필에서 공개 정보를 수정하고 계정을 직접 삭제할 수 있습니다. 앱을
          설치할 수 없는 경우에도 웹 삭제 페이지를 이용할 수 있습니다. 그 밖의
          개인정보 문의는 앱스토어에 표시된 개발자 연락처를 이용해 주세요.
          방침이 바뀌면 이 페이지의 시행일을 갱신해 알립니다.
        </p>
      </section>
    </LegalShell>
  );
}
