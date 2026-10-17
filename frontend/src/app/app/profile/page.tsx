import { Page, PageHeader } from '@/components/app/page';
import { LogoutButton } from '@/components/auth/logout-button';
import { TravelRecordsPanel } from '@/components/profile/travel-records-panel';
import styles from '@/components/profile/profile-page.module.css';
import { Avatar, ButtonLink, Card, Chip, ListRow } from '@/components/ui';
import { travelStyleLabels } from '@/lib/api/profile';
import {
  getOwnProfile,
  getPublicContributorProfile,
} from '@/lib/api/profile.server';
import type { Verification } from '@/lib/api/verifications';
import { getMyVerifications } from '@/lib/api/verifications.server';
import { requireUser } from '@/lib/auth/session';

function VerificationChip({
  verification,
}: {
  verification: Verification | undefined;
}): React.JSX.Element {
  if (verification === undefined)
    return <Chip icon="info">아직 인증 전이에요</Chip>;
  const role = verification.type === 'LOCAL' ? '현지인' : '여행자';
  if (verification.status === 'PENDING') {
    return (
      <Chip tone="warning" icon="clock">
        {role} 인증 심사 중
      </Chip>
    );
  }
  return (
    <Chip
      tone={verification.type === 'LOCAL' ? 'local' : 'traveler'}
      icon="check"
    >
      {verification.destination.nameKo} {role} 인증
    </Chip>
  );
}

export default async function ProfilePage(): Promise<React.JSX.Element> {
  const user = await requireUser('/app/profile');
  const [profile, verifications, contributor] = await Promise.all([
    getOwnProfile(),
    getMyVerifications(),
    getPublicContributorProfile(user.id).catch(() => null),
  ]);
  const current =
    verifications.find((item) => item.status === 'APPROVED') ??
    verifications.find((item) => item.status === 'PENDING');

  return (
    <Page>
      <PageHeader title="내 정보" titleId="profile-title" />

      <div className={styles.grid}>
        <div className={styles.column}>
          <Card className={styles.me} aria-label="내 프로필">
            <div className={styles.meHead}>
              <Avatar
                name={profile.nickname}
                imageUrl={profile.profileImageUrl}
                size="lg"
                tone="plum"
              />
              <div className={styles.meText}>
                <strong>{profile.nickname}</strong>
                <VerificationChip verification={current} />
              </div>
              <ButtonLink
                href="/app/profile/edit"
                variant="secondary"
                size="sm"
              >
                수정
              </ButtonLink>
            </div>
            <p className={profile.bio ? styles.bio : styles.bioEmpty}>
              {profile.bio ??
                '아직 소개를 쓰지 않았어요. 수정에서 한 줄 소개를 남겨 보세요.'}
            </p>
            {profile.travelStyles.length > 0 && (
              <ul className={styles.tags} aria-label="여행 스타일">
                {profile.travelStyles.map((style) => (
                  <li key={style}>
                    <Chip tone="plum">{travelStyleLabels[style]}</Chip>
                  </li>
                ))}
              </ul>
            )}
            {contributor !== null && (
              <dl className={styles.stats}>
                <div>
                  <dt>남긴 답변</dt>
                  <dd>{contributor.stats.answerCount}</dd>
                </div>
                <div>
                  <dt>채택된 답변</dt>
                  <dd>{contributor.stats.acceptedAnswerCount}</dd>
                </div>
              </dl>
            )}
          </Card>

          <Card padding="list" aria-label="바로가기">
            <ListRow
              href="/app/saved-places"
              icon="heart"
              tone="magenta"
              title="찜한 장소"
              description="도움방에서 추천받고 저장한 장소"
            />
            <ListRow
              href="/app/verifications"
              icon="shield"
              tone="plum"
              title="참여 자격"
              description="여행자와 현지인 인증을 확인하고 신청해요"
            />
            <ListRow
              href={`/app/users/${profile.id}`}
              icon="user"
              tone="iris"
              title="공개 프로필 보기"
              description="다른 사람에게 보이는 내 모습"
            />
          </Card>
        </div>

        <div className={styles.column}>
          <TravelRecordsPanel />

          <Card padding="list" aria-labelledby="account-title">
            <h2 className="srOnly" id="account-title">
              계정
            </h2>
            <ListRow
              icon="lock"
              title="로그인 이메일"
              description={`${profile.email} (다른 사용자에게 보이지 않아요)`}
              chevron={false}
            />
            <ListRow
              href="/app/profile/edit"
              icon="settings"
              title="프로필과 계정 관리"
              description="사진, 닉네임, 소개, 계정 삭제"
            />
            <ListRow href="/privacy" icon="info" title="개인정보 처리방침" />
          </Card>

          <LogoutButton />
        </div>
      </div>
    </Page>
  );
}
