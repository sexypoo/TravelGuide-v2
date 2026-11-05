import { redirect } from 'next/navigation';
import { QuestionDetailView } from '@/components/questions/question-detail';
import { getQuestionRoomId } from '@/lib/api/questions.server';
import { getRooms } from '@/lib/api/rooms.server';
import { requireUser } from '@/lib/auth/session';

interface QuestionPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionPage({
  params,
}: QuestionPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  // Guard first so a signed-out redirect carries this question's path.
  const user = await requireUser(`/app/questions/${encodeURIComponent(id)}`);
  const [rooms, roomId] = await Promise.all([
    getRooms(),
    getQuestionRoomId(id),
  ]);
  const room = rooms.find((candidate) => candidate.id === roomId);
  if (room === undefined) redirect('/app/rooms');
  if (!room.access.canViewContent)
    redirect(`/app/rooms/${encodeURIComponent(room.slug)}`);
  return (
    <QuestionDetailView questionId={id} room={room} currentUserId={user.id} />
  );
}
