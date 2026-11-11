import { Page, PageHeader } from '@/components/app/page';
import { NearbyPlacesExplorer } from '@/components/places/nearby-places-explorer';
import { requireUser } from '@/lib/auth/session';
import { getMessages } from '@/i18n/server';

export default async function NearbyPage(): Promise<React.JSX.Element> {
  await requireUser('/app/nearby');
  const copy = (await getMessages()).places.nearby;
  return (
    <Page>
      <PageHeader
        title={copy.title}
        description={<span id="nearby-lede">{copy.description}</span>}
      />
      <NearbyPlacesExplorer />
    </Page>
  );
}
