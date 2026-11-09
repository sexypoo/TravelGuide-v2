import { Page, PageHeader } from '@/components/app/page';
import type { Locale } from '@/i18n/config';
import type { Messages } from '@/i18n/messages';
import { getLocale, getMessages } from '@/i18n/server';
import { communityCategoryLabelsFor } from '@/lib/community/presentation';
import { LiveRoomCard } from '@/components/rooms/live-room-card';
import {
  ButtonLink,
  Card,
  Chip,
  EmptyState,
  ListRow,
  SectionHead,
} from '@/components/ui';
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
import { destinationName, myRooms } from '@/lib/rooms/presentation';
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

function StatusChip({
  verification,
  t,
  locale,
}: {
  verification: Verification | undefined;
  t: Messages['home']['status'];
  locale: Locale;
}): React.JSX.Element {
  if (verification?.status === 'APPROVED') {
    return (
      <Chip
        tone={verification.type === 'LOCAL' ? 'local' : 'traveler'}
        icon="check"
      >
        {t.approved(
          destinationName(verification.destination, locale),
          verification.type,
        )}
      </Chip>
    );
  }
  if (verification?.status === 'PENDING') {
    return (
      <Chip tone="warning" icon="clock">
        {t.pending(verification.type)}
      </Chip>
    );
  }
  return <Chip icon="info">{t.none}</Chip>;
}

export default async function AppHome(): Promise<React.JSX.Element> {
  // Guard first so a signed-out redirect always carries next=/app.
  const user = await requireUser('/app');
  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);
  const t = messages.home;
  const categoryLabels = communityCategoryLabelsFor(locale);
  const [allRooms, verifications, posts] = await Promise.all([
    getRooms(),
    getMyVerifications(),
    recentPosts(),
  ]);
  const rooms = myRooms(allRooms);
  const feeds = await Promise.all(rooms.map(openQuestionsFor));
  const summarySource =
    verifications.find((item) => item.status === 'APPROVED') ??
    verifications.find((item) => item.status === 'PENDING');
  const qualifications = (['TRAVELER', 'LOCAL'] as const)
    .filter((type) => type !== summarySource?.type)
    .map((type) => ({
      type,
      ...getQualificationPresentation(verifications, type, locale),
    }));
  const firstRoom = rooms[0];
  const place =
    firstRoom === undefined
      ? undefined
      : destinationName(firstRoom.destination, locale);
  const [headingLead, headingTail] = t.heading(place);
  const now = new Date();

  return (
    <Page>
      <PageHeader title={t.title} brand />

      <div className={styles.greeting}>
        <p>{t.greeting(user.nickname)}</p>
        <h2>
          {headingLead}
          <br className={styles.mobileBreak} /> {headingTail}
        </h2>
        <Link className={styles.status} href="/app/verifications">
          <StatusChip
            verification={summarySource}
            t={t.status}
            locale={locale}
          />
        </Link>
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          {rooms.length === 0 ? (
            <Card>
              <EmptyState
                icon="room"
                tone="iris"
                title={
                  allRooms.length === 0
                    ? t.noRooms.title
                    : t.pickRoom.title(allRooms.length)
                }
                description={
                  allRooms.length === 0
                    ? t.noRooms.description
                    : t.pickRoom.description
                }
                action={
                  allRooms.length === 0 ? undefined : (
                    <ButtonLink href="/app/rooms" size="md">
                      {t.pickRoom.action}
                    </ButtonLink>
                  )
                }
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
          <Card padding="list" aria-label={t.ways.label}>
            <ListRow
              href="/app/community"
              icon="community"
              tone="iris"
              title={t.ways.communityTitle}
              description={t.ways.communityDescription}
            />
            {allRooms.length > 0 && (
              <ListRow
                href="/app/rooms"
                icon="room"
                tone="magenta"
                title={t.ways.roomsTitle}
                description={t.ways.roomsDescription(allRooms.length)}
              />
            )}
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
                title={t.posts.title}
                action={<Link href="/app/community">{t.posts.viewAll}</Link>}
              />
            </div>
            {posts === null ? (
              <p className={styles.postsNote}>{t.posts.failed}</p>
            ) : posts.length === 0 ? (
              <EmptyState
                icon="pencil"
                title={t.posts.emptyTitle}
                description={t.posts.emptyDescription}
              />
            ) : (
              <ul className={styles.postList}>
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link href={`/app/community/${post.id}`}>
                      <span className={styles.postTitle}>{post.title}</span>
                      <span className={styles.postMeta}>
                        <span>{categoryLabels[post.category]}</span>
                        <span>{t.posts.comments(post.commentCount)}</span>
                        <span>
                          {formatRelativeTime(post.createdAt, now, locale)}
                        </span>
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
