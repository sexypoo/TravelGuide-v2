import Link from 'next/link';
import { SavedPlacesList } from '@/components/places/saved-places-list';
import { AppIcon } from '@/components/common';
import styles from '@/components/profile/profile.module.css';

export default function SavedPlacesPage(): React.JSX.Element {
  return (
    <div className={styles.page}>
      <Link className={`appBackLink ${styles.back}`} href="/app/profile">
        <AppIcon name="arrow-left" /> 프로필로
      </Link>
      <header className={styles.header}>
        <h1 id="saved-places-title">찜한 장소</h1>
        <p id="saved-places-lede">
          실시간방에서 추천받고 저장한 장소를 모아 봤어요.
        </p>
      </header>
      <SavedPlacesList />
    </div>
  );
}
