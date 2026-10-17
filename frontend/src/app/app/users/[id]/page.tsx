import { Page, PageHeader } from '@/components/app/page';
import styles from '@/components/profile/profile-page.module.css';
import { Avatar, Card, Chip, ListRow } from '@/components/ui';
import { getPublicContributorProfile } from '@/lib/api/profile.server';
import { requireUser } from '@/lib/auth/session';

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
  await requireUser(`/app/users/${encodeURIComponent(id)}`);
  const profile = await getPublicContributorProfile(id);
  const local = profile.isVerifiedLocal && profile.verifiedDestination !== null;

  return (
    <Page>
      <PageHeader title="프로필" backHref="/app" backLabel="홈으로" />
      <div className={styles.narrow}>
        <Card className={styles.me} aria-labelledby="profile-name">
          <div className={styles.meHead}>
            <Avatar
              name={profile.nickname}
              imageUrl={profile.profileImageUrl}
              size="lg"
              tone={local ? 'iris' : 'magenta'}
            />
            <div className={styles.meText}>
              <strong id="profile-name">{profile.nickname}</strong>
              {local && profile.verifiedDestination !== null ? (
                <Chip tone="local" icon="shield">
                  {profile.verifiedDestination.nameKo} 인증 현지인
                </Chip>
              ) : (
                <Chip tone="traveler" icon="pin">
                  여행자 기여자
                </Chip>
              )}
            </div>
          </div>
          <p className={profile.bio ? styles.bio : styles.bioEmpty}>
            {profile.bio ?? '아직 소개를 작성하지 않았어요.'}
          </p>
          <dl className={styles.stats} aria-label="공개 기여 통계">
            <div>
              <dt>남긴 답변</dt>
              <dd>{profile.stats.answerCount}</dd>
            </div>
            <div>
              <dt>채택된 답변</dt>
              <dd>{profile.stats.acceptedAnswerCount}</dd>
            </div>
          </dl>
        </Card>

        <Card padding="list" aria-label="활동 정보">
          <ListRow
            icon="clock"
            tone="neutral"
            title={`${formatDate(profile.joinedAt)}부터 정보를 나누고 있어요`}
            chevron={false}
          />
          {local && (
            <ListRow
              icon="shield"
              tone="iris"
              title={
                profile.verifiedAt === null
                  ? '유효한 지역 인증'
                  : `${formatDate(profile.verifiedAt)} 인증`
              }
              description="증빙과 관리자 심사로 확인된 현지인이에요"
              chevron={false}
            />
          )}
        </Card>

        <p className={styles.bioEmpty}>
          활동 수치는 공개 상태인 답변만 반영하며 평점이나 순위를 뜻하지 않아요.
        </p>
      </div>
    </Page>
  );
}
