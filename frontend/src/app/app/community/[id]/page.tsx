import { CommunityDetail } from '@/components/community/community-detail';
import { requireUser } from '@/lib/auth/session';

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const user = await requireUser(`/app/community/${id}`);
  return <CommunityDetail postId={id} currentUserId={user.id} />;
}
