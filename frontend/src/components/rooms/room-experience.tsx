'use client';

import Link from 'next/link';
import { useState } from 'react';
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

  return (
    <div className="roomExperience chatRoomExperience">
      <Link className="appBackLink" href="/app">
        <span aria-hidden="true">←</span> 홈으로
      </Link>

      <header className="conversationRoomHeader">
        <div className="conversationRoomHeader__signal" aria-hidden="true">
          <span />
          <svg viewBox="0 0 96 70">
            <path d="M81 30c4 11-3 23-18 29-18 8-43 4-50-8-7-11 5-26 24-34 17-7 38-8 44 3Z" />
          </svg>
        </div>
        <div className="conversationRoomHeader__copy">
          <div className="liveRoomEyebrow">
            <span>TRAVEL LIVE ROOM</span>
            <span
              className={`connectionPill connectionPill--${connectionState}`}
            >
              <i aria-hidden="true" /> {connectionCopy[connectionState]}
            </span>
          </div>
          <h1>{room.title}</h1>
          <p>
            {room.destination.nameKo}의 지금을 이야기하고, 중요한 상황은
            토픽으로 이어가세요.
          </p>
        </div>
        <div className="conversationRoomHeader__actions">
          <RoomNotificationControl />
          <span className="roomRoleBadge">
            <span aria-hidden="true">✓</span>
            {roleLabel(room)}
          </span>
        </div>
      </header>

      <div className="roomTrustLine">
        <span aria-hidden="true">●</span>
        인증된 참여자만 대화합니다. 증빙과 정확한 위치는 공개되지 않아요.
      </div>

      <div className="mobileRoomSwitcher" role="tablist" aria-label="방 보기">
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

      <div className="conversationWorkspace" data-mobile-view={mobileView}>
        <section
          className="conversationStage"
          aria-label={`${room.destination.nameKo} 대화`}
        >
          {connectionState !== 'connected' && (
            <div className="connectionNotice" role="status" aria-live="polite">
              {connectionState === 'offline'
                ? '인터넷 연결을 확인해 주세요. 연결되면 놓친 대화를 자동으로 다시 불러옵니다.'
                : '실시간 연결을 복구하고 있어요. 연결되면 놓친 대화를 자동으로 다시 불러옵니다.'}
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

        <aside className="topicRail" aria-labelledby="topic-rail-title">
          <header className="topicRail__header">
            <div>
              <span>LIVE TOPICS</span>
              <h2 id="topic-rail-title">지금 이어지는 토픽</h2>
            </div>
            {room.access.canCreateTopic && (
              <button type="button" onClick={openDirectTopic}>
                + 새 토픽
              </button>
            )}
          </header>

          {topicComposerOpen && (
            <div className="topicComposerTray">
              <button
                className="topicComposerTray__close"
                type="button"
                onClick={closeComposer}
                aria-label="토픽 작성 닫기"
              >
                ×
              </button>
              <QuestionComposer
                key={sourceMessage?.id ?? 'direct-topic'}
                roomSlug={room.slug}
                sourceMessage={sourceMessage}
                onCreated={closeComposer}
              />
            </div>
          )}

          <div
            className="roomTabs topicTabs"
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
