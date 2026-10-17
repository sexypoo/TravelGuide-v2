import { Page, PageHeader } from '@/components/app/page';
import { NearbyPlacesExplorer } from '@/components/places/nearby-places-explorer';
import { requireUser } from '@/lib/auth/session';

export default async function NearbyPage(): Promise<React.JSX.Element> {
  await requireUser('/app/nearby');
  return (
    <Page>
      <PageHeader
        title="주변"
        description={
          <span id="nearby-lede">
            현재 위치에서 1.5km 안의 영업 중 식당을 가까운 순서로 보여줘요.
          </span>
        }
      />
      <NearbyPlacesExplorer />
    </Page>
  );
}
