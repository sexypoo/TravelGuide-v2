import Link from 'next/link';
import { SavedPlacesList } from '@/components/places/saved-places-list';
import { AppIcon } from '@/components/common';

export default function SavedPlacesPage(): React.JSX.Element {
  return (
    <div className="savedPlacesPage">
      <Link className="appBackLink" href="/app/profile">
        <AppIcon name="arrow-left" /> 프로필로
      </Link>
      <header className="pageHeading">
        <p>다시 가고 싶은 곳</p>
        <h1>찜한 장소</h1>
        <span>실시간방에서 추천받고 저장한 장소를 모아봤어요.</span>
      </header>
      <SavedPlacesList />
    </div>
  );
}
