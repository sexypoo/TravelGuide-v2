import Link from 'next/link';
import { AppIcon } from '@/components/common';
import { VerificationStatusCard } from '@/components/verifications/verification-status-card';
import { getMyVerifications } from '@/lib/api/verifications.server';

interface PageProps {
  searchParams: Promise<{ submitted?: string | string[] }>;
}

export default async function VerificationsPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const [verifications, query] = await Promise.all([
    getMyVerifications(),
    searchParams,
  ]);
  const submitted =
    query.submitted === 'traveler'
      ? '여행자'
      : query.submitted === 'local'
        ? '현지인'
        : null;
  const pendingTypes = new Set(
    verifications
      .filter((item) => item.status === 'PENDING')
      .map((item) => item.type),
  );

  return (
    <div className="verificationOverview">
      <header className="pageHeading">
        <p>나의 참여 자격</p>
        <h1>제주와 연결되는 패스</h1>
        <span>
          신청 진행 상황과 방에 참여할 수 있는 기간을 한곳에서 확인하세요.
        </span>
      </header>
      {submitted !== null && (
        <div className="submissionSuccess" role="status">
          <span>
            <AppIcon name="check" />
          </span>
          <div>
            <strong>{submitted} 인증을 보냈어요</strong>
            <p>관리자가 확인하면 이 화면에 바로 반영됩니다.</p>
          </div>
        </div>
      )}
      {verifications.length > 0 ? (
        <section className="verificationPassList" aria-label="인증 신청 내역">
          {verifications.map((item) => (
            <VerificationStatusCard key={item.id} verification={item} />
          ))}
        </section>
      ) : (
        <section className="verificationEmpty">
          <span aria-hidden="true">
            <AppIcon name="live" />
          </span>
          <h2>아직 만든 패스가 없어요</h2>
          <p>질문하려면 여행자 인증을, 답변하려면 현지인 인증을 시작하세요.</p>
        </section>
      )}
      <section
        className="verificationChoices"
        aria-labelledby="verification-choice-title"
      >
        <div>
          <p>새 인증 신청</p>
          <h2 id="verification-choice-title">어떤 방식으로 참여할까요?</h2>
        </div>
        <div className="verificationChoiceGrid">
          <Link
            aria-disabled={pendingTypes.has('TRAVELER')}
            className={pendingTypes.has('TRAVELER') ? 'isDisabled' : undefined}
            href={
              pendingTypes.has('TRAVELER')
                ? '/app/verifications'
                : '/app/verifications/traveler'
            }
          >
            <span className="qualificationIcon qualificationIcon--traveler">
              <AppIcon name="pin" />
            </span>
            <strong>여행자로 질문하기</strong>
            <p>
              {pendingTypes.has('TRAVELER')
                ? '여행자 신청을 심사하고 있어요.'
                : '일정과 예약 증빙으로 신청해요.'}
            </p>
            <b>
              {pendingTypes.has('TRAVELER') ? (
                '심사 중'
              ) : (
                <>
                  신청 시작 <AppIcon name="arrow-right" />
                </>
              )}
            </b>
          </Link>
          <Link
            aria-disabled={pendingTypes.has('LOCAL')}
            className={pendingTypes.has('LOCAL') ? 'isDisabled' : undefined}
            href={
              pendingTypes.has('LOCAL')
                ? '/app/verifications'
                : '/app/verifications/local'
            }
          >
            <span className="qualificationIcon qualificationIcon--local">
              <AppIcon name="shield" />
            </span>
            <strong>현지인으로 답변하기</strong>
            <p>
              {pendingTypes.has('LOCAL')
                ? '현지인 신청을 심사하고 있어요.'
                : '위치와 연고 증빙으로 신청해요.'}
            </p>
            <b>
              {pendingTypes.has('LOCAL') ? (
                '심사 중'
              ) : (
                <>
                  신청 시작 <AppIcon name="arrow-right" />
                </>
              )}
            </b>
          </Link>
        </div>
      </section>
      <div className="verificationGuide__notice">
        <span aria-hidden="true">
          <AppIcon name="info" />
        </span>
        <p>증빙과 정확한 위치는 공개되지 않으며 관리자 심사에만 사용됩니다.</p>
      </div>
    </div>
  );
}
