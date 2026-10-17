import { Page, PageHeader } from '@/components/app/page';
import { communityCategoryLabels } from '@/lib/community/presentation';
import { LiveRoomCard } from '@/components/rooms/live-room-card';
import { Card, Chip, EmptyState, ListRow, SectionHead } from '@/components/ui';
import type { CommunityPost } from '@/lib/api/community';
import { getRecentCommunityPosts } from '@/lib/api/community.server';
import type { QuestionPage } from '@/lib/api/questions';
import { getOpenQuestions } from '@/lib/api/questions.server';
import type { Room } from '@/lib/api/rooms';
import { getRooms } from '@/lib/api/rooms.server';
import type { Verification } from '@/lib/api/verifications';
import { getMyVerifications } from '@/lib/api/verifications.server';
import { requireUser } from '@/lib/auth/session';
import { formatRelativeTime } from '@/lib/questions/presentation';
import { getQualificationPresentation } from '@/lib/verifications/presentation';
import Link from 'next/link';
import styles from './home.module.css';

async function openQuestionsFor(room: Room): Promise<QuestionPage | null> {
  if (!room.access.canViewContent) return null;
  try {
    return await getOpenQuestions(room.slug, 3);
  } catch {
    // The card still offers the way in; the feed is a bonus.
    return null;
  }
}

async function recentPosts(): Promise<CommunityPost[] | null> {
  try {
    return await getRecentCommunityPosts(3);
  } catch {
    return null;
  }
}

function participantLabel(verification: Verification): string {
  return verification.type === 'TRAVELER' ? '여행자' : '현지인';
}

function StatusChip({
  verification,
}: {
  verification: Verification | undefined;
}): React.JSX.Element {
  if (verification?.status === 'APPROVED') {
    return (
      <Chip
        tone={verification.type === 'LOCAL' ? 'local' : 'traveler'}
        icon="check"
      >
        {verification.destination.nameKo} {participantLabel(verification)} 인증
        완료
      </Chip>
    );
  }
  if (verification?.status === 'PENDING') {
    return (
      <Chip tone="warning" icon="clock">
        {participantLabel(verification)} 인증 심사 중
      </Chip>
    );
  }
  return <Chip icon="info">아직 인증 전이에요</Chip>;
}

export default async function AppHome(): Promise<React.JSX.Element> {
  // Guard first so a signed-out redirect always carries next=/app.
  const user = await requireUser('/app');
  const [rooms, verifications, posts] = await Promise.all([
    getRooms(),
    getMyVerifications(),
    recentPosts(),
  ]);
  const feeds = await Promise.all(rooms.map(openQuestionsFor));
  const summarySource =
    verifications.find((item) => item.status === 'APPROVED') ??
    verifications.find((item) => item.status === 'PENDING');
  const qualifications = (['TRAVELER', 'LOCAL'] as const)
    .filter((type) => type !== summarySource?.type)
    .map((type) => ({
      type,
      ...getQualificationPresentation(verifications, type),
    }));
  const place = rooms[0]?.destination.nameKo;
  const now = new Date();

  return (
    <Page>
      <PageHeader title="홈" brand />

      <div className={styles.greeting}>
        <p>{user.nickname}님, 반가워요</p>
        <h2>
          {place === undefined ? '여행지에서' : `오늘 ${place}에서`}
          <br className={styles.mobileBreak} /> 무엇이 궁금하세요?
        </h2>
        <Link className={styles.status} href="/app/verifications">
          <StatusChip verification={summarySource} />
        </Link>
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          {rooms.length === 0 ? (
            <Card>
              <EmptyState
                icon="room"
                tone="iris"
                title="열려 있는 도움방이 없어요"
                description="지역이 준비되면 이곳에 표시돼요. 그동안 커뮤니티에서 물어보세요."
              />
            </Card>
          ) : (
            rooms.map((room, index) => (
              <LiveRoomCard
                key={room.id}
                room={room}
                openQuestions={feeds[index] ?? null}
                now={now}
              />
            ))
          )}
        </div>

        <div className={styles.side}>
          <Card padding="list" aria-label="다른 방법으로 참여하기">
            <ListRow
              href="/app/community"
              icon="community"
              tone="iris"
              title="여행자 커뮤니티"
              description="인증 없이도 묻고 나눌 수 있어요"
            />
            {qualifications.map((item) => (
              <ListRow
                key={item.type}
                href={item.href}
                icon={item.type === 'LOCAL' ? 'home' : 'shield'}
                tone={item.type === 'LOCAL' ? 'magenta' : 'plum'}
                title={item.title}
                description={item.body}
              />
            ))}
          </Card>

          <Card
            padding="none"
            className={styles.posts}
            aria-labelledby="recent-posts"
          >
            <div className={styles.postsHead}>
              <SectionHead
                id="recent-posts"
                title="커뮤니티 새 글"
                action={<Link href="/app/community">전체 보기</Link>}
              />
            </div>
            {posts === null ? (
              <p className={styles.postsNote}>새 글을 불러오지 못했어요.</p>
            ) : posts.length === 0 ? (
              <EmptyState
                icon="pencil"
                title="아직 글이 없어요"
                description="여행 중 궁금한 걸 처음으로 물어보세요."
              />
            ) : (
              <ul className={styles.postList}>
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link href={`/app/community/${post.id}`}>
                      <span className={styles.postTitle}>{post.title}</span>
                      <span className={styles.postMeta}>
                        <span>{communityCategoryLabels[post.category]}</span>
                        <span>댓글 {post.commentCount}</span>
                        <span>{formatRelativeTime(post.createdAt, now)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </Page>
  );
}
