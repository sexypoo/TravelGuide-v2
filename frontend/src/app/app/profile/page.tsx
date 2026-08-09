import Link from 'next/link';
import { ProfileForm } from '@/components/profile/profile-form';
import { TravelRecordsPanel } from '@/components/profile/travel-records-panel';
import { getOwnProfile } from '@/lib/api/profile.server';
import { AppIcon } from '@/components/common';

function formatJoinDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export default async function ProfilePage(): Promise<React.JSX.Element> {
  const profile = await getOwnProfile();
  const initial = Array.from(profile.nickname)[0] ?? '여';

  return (
    <div className="profilePage">
      <header className="pageHeading">
        <p>내 정보</p>
        <h1>프로필</h1>
        <span>
          질문과 답변에서 다른 사용자에게 보일 기본 정보를 관리합니다.
        </span>
      </header>

      <section className="profileIdentity" aria-label="계정 요약">
        <span className="profileIdentity__avatar" aria-hidden="true">
          {initial}
        </span>
        <div>
          <strong>{profile.nickname}</strong>
          <p>{profile.email}</p>
          <span>{formatJoinDate(profile.createdAt)} 가입</span>
        </div>
        <span className="profileIdentity__status">일반 사용자</span>
      </section>

      <div className="profileQuickLinks">
        <Link className="profileSavedPlacesLink" href="/app/saved-places">
          <span aria-hidden="true">
            <AppIcon name="heart-filled" />
          </span>
          <div>
            <strong>찜한 장소</strong>
            <p>추천받고 저장한 장소를 다시 확인하세요.</p>
          </div>
          <b aria-hidden="true">
            <AppIcon name="arrow-right" />
          </b>
        </Link>
        <Link className="profileSavedPlacesLink" href="/app/verifications">
          <span aria-hidden="true">
            <AppIcon name="shield" />
          </span>
          <div>
            <strong>지역 인증</strong>
            <p>여행자 또는 현지인 인증 상태를 관리하세요.</p>
          </div>
          <b aria-hidden="true">
            <AppIcon name="arrow-right" />
          </b>
        </Link>
      </div>

      <section className="profileEdit" aria-labelledby="profile-edit-title">
        <div>
          <h2 id="profile-edit-title">공개 정보</h2>
          <p>이메일은 다른 사용자에게 표시되지 않습니다.</p>
        </div>
        <ProfileForm profile={profile} />
      </section>

      <TravelRecordsPanel />
    </div>
  );
}
