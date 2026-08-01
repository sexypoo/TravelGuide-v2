import { CommunityBoard } from '@/components/community/community-board';
import { requireUser } from '@/lib/auth/session';

export default async function CommunityPage(): Promise<React.JSX.Element> {
  const user = await requireUser('/app/community');
  return <CommunityBoard currentUserId={user.id} />;
}
