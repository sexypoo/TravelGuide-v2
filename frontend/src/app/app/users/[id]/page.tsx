import Link from 'next/link';
import { getPublicContributorProfile } from '@/lib/api/profile.server';

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const profile = await getPublicContributorProfile(id);
  const initial = Array.from(profile.nickname)[0] ?? '여';

  return (
    <main className="contributorProfilePage">
      <Link className="appBackLink" href="/app">
        ← 여행지로 돌아가기
      </Link>

      <section className="contributorPassport" aria-labelledby="profile-name">
        <div className="contributorPassport__path" aria-hidden="true" />
        <header>
          <span className="contributorPassport__avatar" aria-hidden="true">
            {initial}
          </span>
          <div>
            <p>TRAVEL SIGNAL CONTRIBUTOR</p>
            <h1 id="profile-name">{profile.nickname}</h1>
            <span>{formatDate(profile.joinedAt)}부터 정보 공유</span>
          </div>
        </header>

        <p className="contributorPassport__bio">
          {profile.bio ?? '아직 소개를 작성하지 않았습니다.'}
        </p>

        <dl className="contributorStats" aria-label="공개 기여 통계">
          <div>
            <dt>남긴 답변</dt>
            <dd>{profile.stats.answerCount}</dd>
            <span>공개 답변 기준</span>
          </div>
          <div>
            <dt>채택된 답변</dt>
            <dd>{profile.stats.acceptedAnswerCount}</dd>
            <span>여행자에게 도움 된 정보</span>
          </div>
        </dl>

        {profile.isVerifiedLocal && profile.verifiedDestination !== null ? (
          <aside className="contributorVerification">
            <span aria-hidden="true">✓</span>
            <div>
              <strong>{profile.verifiedDestination.nameKo} 인증 현지인</strong>
              <p>
                {profile.verifiedAt === null
                  ? '유효한 지역 인증'
                  : `${formatDate(profile.verifiedAt)} 인증`}
              </p>
            </div>
          </aside>
        ) : (
          <aside className="contributorVerification contributorVerification--traveler">
            <span aria-hidden="true">↗</span>
            <div>
              <strong>여행자 기여자</strong>
              <p>여행 중 확인한 정보를 함께 나누고 있어요.</p>
            </div>
          </aside>
        )}
      </section>

      <p className="contributorProfileNote">
        활동 수치는 공개 상태인 답변만 반영하며 평점이나 순위를 뜻하지 않습니다.
      </p>
    </main>
  );
}
