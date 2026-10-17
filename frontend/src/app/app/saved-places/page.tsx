import { Page, PageHeader } from '@/components/app/page';
import { SavedPlacesList } from '@/components/places/saved-places-list';
import { requireUser } from '@/lib/auth/session';

export default async function SavedPlacesPage(): Promise<React.JSX.Element> {
  await requireUser('/app/saved-places');
  return (
    <Page>
      <PageHeader
        title="찜한 장소"
        backHref="/app/profile"
        backLabel="내 정보로"
        description={
          <span id="saved-places-lede">
            실시간방에서 추천받고 저장한 장소를 모아 봤어요.
          </span>
        }
      />
      <SavedPlacesList />
    </Page>
  );
}
