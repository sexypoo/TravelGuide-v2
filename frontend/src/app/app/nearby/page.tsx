import { NearbyPlacesExplorer } from '@/components/places/nearby-places-explorer';
import { requireUser } from '@/lib/auth/session';

export default async function NearbyPage(): Promise<React.JSX.Element> {
  await requireUser('/app/nearby');
  return <NearbyPlacesExplorer />;
}
