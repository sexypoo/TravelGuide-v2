'use client';

import { useState } from 'react';
import {
  Button,
  Chip,
  IconButton,
  IconLink,
  Notice,
  uiStyles,
} from '@/components/ui';
import styles from './room.module.css';
import { useLocale, useMessages } from '@/i18n/client';
import type { Messages } from '@/i18n/messages';
import { MessageComposer } from '@/components/messages/message-composer';
import { MessageTimeline } from '@/components/messages/message-timeline';
import { useRoomRealtime } from '@/components/providers/realtime-provider';
import { RoomNotificationControl } from '@/components/rooms/room-notification-control';
import { QuestionComposer } from '@/components/questions/question-composer';
import { QuestionFeed } from '@/components/questions/question-feed';
import type { ChatMessage } from '@/lib/api/messages';
import type { QuestionListStatus } from '@/lib/api/questions';
import type { Room } from '@/lib/api/rooms';
import { destinationName } from '@/lib/rooms/presentation';

function roleLabel(
  room: Room,
  t: Messages['rooms']['experience']['role'],
): string {
  return t[room.access.participantKind ?? 'none'];
}

export function RoomExperience({
  room,
  currentUserId,
}: {
  room: Room;
  currentUserId: string;
}): React.JSX.Element {
  const [status, setStatus] = useState<QuestionListStatus>('OPEN');
  const [mobileView, setMobileView] = useState<'chat' | 'topics'>('chat');
  const [topicComposerOpen, setTopicComposerOpen] = useState(false);
  const [sourceMessage, setSourceMessage] = useState<ChatMessage>();
  const connectionState = useRoomRealtime(room.slug, true);
  const messages = useMessages();
  const locale = useLocale();
  const t = messages.rooms.experience;
  const city = destinationName(room.destination, locale);

  function openDirectTopic(): void {
    setSourceMessage(undefined);
    setTopicComposerOpen(true);
    setMobileView('topics');
  }

  function promoteMessage(message: ChatMessage): void {
    setSourceMessage(message);
    setTopicComposerOpen(true);
    setMobileView('topics');
  }

  function closeComposer(): void {
    setTopicComposerOpen(false);
    setSourceMessage(undefined);
  }

  function finishTopicCreation(result: { autoShared: boolean }): void {
    closeComposer();
    if (result.autoShared) setMobileView('chat');
  }

  const roleTone =
    room.access.participantKind === 'LOCAL'
      ? 'local'
      : room.access.participantKind === null
        ? 'neutral'
        : 'traveler';

  return (
    <div className={styles.room} data-testid="room-experience">
      <header className={styles.bar}>
        <IconLink href="/app" icon="chevron-left" label={t.home} />
        <div className={styles.barText}>
          <h1>{messages.rooms.roomName(city)}</h1>
          <p>
            <span
              className={styles.connection}
              data-state={connectionState}
              aria-hidden="true"
            />
            <span role="status">
              {connectionState === 'connected'
                ? t.connectedNote
                : t.connection[connectionState]}
            </span>
          </p>
        </div>
        <div className={styles.barActions}>
          <span className={styles.role}>
            <Chip tone={roleTone} icon="check">
              {roleLabel(room, t.role)}
            </Chip>
          </span>
          <RoomNotificationControl />
        </div>
      </header>

      <div className={styles.tabs}>
        <div
          className={uiStyles.segmented}
          role="tablist"
          aria-label={t.viewTabs}
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileView === 'chat'}
            onClick={() => setMobileView('chat')}
          >
            {t.chatTab}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileView === 'topics'}
            onClick={() => setMobileView('topics')}
          >
            {t.topicsTab}
          </button>
        </div>
      </div>

      <div className={styles.workspace} data-mobile-view={mobileView}>
        <section
          className={styles.stage}
          aria-label={t.conversationLabel(city)}
        >
          <h2 className="srOnly">{t.liveChatHeading}</h2>
          {connectionState !== 'connected' && (
            <div className={styles.notice} aria-live="polite">
              <Notice tone="warning" icon="refresh">
                {connectionState === 'offline'
                  ? t.offlineNotice
                  : t.reconnectingNotice}
              </Notice>
            </div>
          )}
          <MessageTimeline
            roomSlug={room.slug}
            currentUserId={currentUserId}
            onPromote={promoteMessage}
          />
          {room.access.canChat && (
            <MessageComposer
              roomSlug={room.slug}
              onCreateTopic={
                room.access.canCreateTopic ? openDirectTopic : undefined
              }
            />
          )}
        </section>

        <aside className={styles.rail} aria-labelledby="topic-rail-title">
          <header className={styles.railHead}>
            <h2 id="topic-rail-title">{t.openTopics}</h2>
            {room.access.canCreateTopic && (
              <Button size="sm" icon="add" onClick={openDirectTopic}>
                {t.newTopic}
              </Button>
            )}
          </header>

          {topicComposerOpen && (
            <div className={styles.tray}>
              <IconButton
                className={styles.trayClose}
                icon="close"
                label={t.closeComposer}
                onClick={closeComposer}
              />
              <QuestionComposer
                key={sourceMessage?.id ?? 'direct-topic'}
                roomSlug={room.slug}
                sourceMessage={sourceMessage}
                onCreated={finishTopicCreation}
              />
            </div>
          )}

          <div
            className={`${uiStyles.segmented} ${styles.railStatus}`}
            role="tablist"
            aria-label={t.topicStatus}
          >
            <button
              type="button"
              role="tab"
              aria-selected={status === 'OPEN'}
              onClick={() => setStatus('OPEN')}
            >
              {t.open}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={status === 'RESOLVED'}
              onClick={() => setStatus('RESOLVED')}
            >
              {t.resolved}
            </button>
          </div>
          <QuestionFeed
            roomSlug={room.slug}
            status={status}
            canShare={room.access.canChat}
          />
        </aside>
      </div>
    </div>
  );
}
