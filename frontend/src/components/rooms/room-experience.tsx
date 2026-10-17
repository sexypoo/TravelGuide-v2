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
import { MessageComposer } from '@/components/messages/message-composer';
import { MessageTimeline } from '@/components/messages/message-timeline';
import { useRoomRealtime } from '@/components/providers/realtime-provider';
import { RoomNotificationControl } from '@/components/rooms/room-notification-control';
import { QuestionComposer } from '@/components/questions/question-composer';
import { QuestionFeed } from '@/components/questions/question-feed';
import type { ChatMessage } from '@/lib/api/messages';
import type { QuestionListStatus } from '@/lib/api/questions';
import type { Room } from '@/lib/api/rooms';

const connectionCopy = {
  connecting: '연결 확인 중',
  connected: '실시간 연결됨',
  reconnecting: '다시 연결 중',
  offline: '실시간 연결 끊김',
} as const;

function roleLabel(room: Room): string {
  if (room.access.participantKind === 'BOTH') return '여행자 · 현지인 인증';
  if (room.access.participantKind === 'LOCAL') return '인증 현지인';
  if (room.access.participantKind === 'TRAVELER') return '인증 여행자';
  return '관리자 · 읽기 전용';
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
        <IconLink href="/app" icon="chevron-left" label="홈으로" />
        <div className={styles.barText}>
          <h1>{room.destination.nameKo} 도움방</h1>
          <p>
            <span
              className={styles.connection}
              data-state={connectionState}
              aria-hidden="true"
            />
            <span role="status">
              {connectionState === 'connected'
                ? '인증된 여행자와 현지인만 대화해요'
                : connectionCopy[connectionState]}
            </span>
          </p>
        </div>
        <div className={styles.barActions}>
          <span className={styles.role}>
            <Chip tone={roleTone} icon="check">
              {roleLabel(room)}
            </Chip>
          </span>
          <RoomNotificationControl />
        </div>
      </header>

      <div className={styles.tabs}>
        <div className={uiStyles.segmented} role="tablist" aria-label="방 보기">
          <button
            type="button"
            role="tab"
            aria-selected={mobileView === 'chat'}
            onClick={() => setMobileView('chat')}
          >
            대화
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileView === 'topics'}
            onClick={() => setMobileView('topics')}
          >
            실시간 토픽
          </button>
        </div>
      </div>

      <div className={styles.workspace} data-mobile-view={mobileView}>
        <section
          className={styles.stage}
          aria-label={`${room.destination.nameKo} 대화`}
        >
          <h2 className="srOnly">실시간 대화</h2>
          {connectionState !== 'connected' && (
            <div className={styles.notice} aria-live="polite">
              <Notice tone="warning" icon="refresh">
                {connectionState === 'offline'
                  ? '인터넷 연결을 확인해 주세요. 연결되면 놓친 대화를 자동으로 다시 불러와요.'
                  : '실시간 연결을 복구하고 있어요. 연결되면 놓친 대화를 자동으로 다시 불러와요.'}
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
            <h2 id="topic-rail-title">진행 중인 토픽</h2>
            {room.access.canCreateTopic && (
              <Button size="sm" icon="add" onClick={openDirectTopic}>
                새 토픽
              </Button>
            )}
          </header>

          {topicComposerOpen && (
            <div className={styles.tray}>
              <IconButton
                className={styles.trayClose}
                icon="close"
                label="토픽 작성 닫기"
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
            aria-label="토픽 상태"
          >
            <button
              type="button"
              role="tab"
              aria-selected={status === 'OPEN'}
              onClick={() => setStatus('OPEN')}
            >
              진행 중
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={status === 'RESOLVED'}
              onClick={() => setStatus('RESOLVED')}
            >
              해결됨
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
