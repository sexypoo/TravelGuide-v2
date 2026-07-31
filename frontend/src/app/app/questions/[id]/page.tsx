import { redirect } from 'next/navigation';
import { QuestionDetailView } from '@/components/questions/question-detail';
import { getRoom } from '@/lib/api/rooms.server';
import { requireUser } from '@/lib/auth/session';

interface QuestionPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionPage({
  params,
}: QuestionPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const [user, room] = await Promise.all([
    requireUser(`/app/questions/${encodeURIComponent(id)}`),
    getRoom('jeju'),
  ]);
  if (!room.access.canViewContent) redirect('/app/rooms/jeju');
  return (
    <QuestionDetailView questionId={id} room={room} currentUserId={user.id} />
  );
}
