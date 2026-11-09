import { Page, PageHeader } from '@/components/app/page';
import { SavedPlacesList } from '@/components/places/saved-places-list';
import { requireUser } from '@/lib/auth/session';
import { getMessages } from '@/i18n/server';

export default async function SavedPlacesPage(): Promise<React.JSX.Element> {
  await requireUser('/app/saved-places');
  const copy = (await getMessages()).places.saved;
  return (
    <Page>
      <PageHeader
        title={copy.title}
        backHref="/app/profile"
        backLabel={copy.backLabel}
        description={<span id="saved-places-lede">{copy.description}</span>}
      />
      <SavedPlacesList />
    </Page>
  );
}
