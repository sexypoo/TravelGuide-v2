'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { QuestionListStatus } from '@/lib/api/questions';
import type { Room } from '@/lib/api/rooms';
import { useRoomRealtime } from '@/components/providers/realtime-provider';
import { QuestionComposer } from '@/components/questions/question-composer';
import { QuestionFeed } from '@/components/questions/question-feed';

const connectionCopy = {
  connecting: '연결 확인 중',
  connected: '실시간 연결됨',
  reconnecting: '다시 연결 중',
  offline: '실시간 연결 끊김',
} as const;

export function RoomExperience({ room }: { room: Room }): React.JSX.Element {
  const [status, setStatus] = useState<QuestionListStatus>('OPEN');
  const [composerOpen, setComposerOpen] = useState(false);
  const connectionState = useRoomRealtime(room.slug, true);

  return (
    <div className="roomExperience">
      <Link className="appBackLink" href="/app">
        <span aria-hidden="true">←</span> 홈으로
      </Link>
      <header className="liveRoomHeader">
        <div className="liveRoomHeader__signal" aria-hidden="true">
          <span />
          <svg viewBox="0 0 96 70">
            <path d="M81 30c4 11-3 23-18 29-18 8-43 4-50-8-7-11 5-26 24-34 17-7 38-8 44 3Z" />
          </svg>
        </div>
        <div className="liveRoomHeader__copy">
          <div className="liveRoomEyebrow">
            <span>JEJU ROOM</span>
            <span
              className={`connectionPill connectionPill--${connectionState}`}
            >
              <i aria-hidden="true" /> {connectionCopy[connectionState]}
            </span>
          </div>
          <h1>{room.title}</h1>
          <p>
            여행이 틀어진 순간을 남기면, 인증된 제주 현지인들이 각자의 근거로
            답합니다.
          </p>
        </div>
        <span className="roomRoleBadge">
          <span aria-hidden="true">
            {room.access.canAskQuestion ? '↗' : '⌂'}
          </span>
          {room.access.canAskQuestion ? '인증 여행자' : '인증 현지인'}
        </span>
      </header>

      <div className="roomTrustStrip">
        <span aria-hidden="true">✓</span>
        <p>
          <strong>인증된 여행자와 현지인만 참여합니다.</strong> 증빙과 정확한
          위치는 이 방에 공개되지 않아요.
        </p>
      </div>

      <div
        className={`roomWorkspace${composerOpen ? ' roomWorkspace--composer' : ''}`}
      >
        <section className="roomFeedColumn" aria-labelledby="room-feed-title">
          <div className="roomFeedToolbar">
            <div>
              <p>LIVE QUESTIONS</p>
              <h2 id="room-feed-title">제주의 지금을 묻는 질문</h2>
            </div>
            {room.access.canAskQuestion && (
              <button
                type="button"
                onClick={() => setComposerOpen((value) => !value)}
              >
                {composerOpen ? '작성 닫기' : '지금 질문하기'}
              </button>
            )}
          </div>
          {!room.access.canAskQuestion && room.access.canAnswer && (
            <div className="localGuidance">
              <span aria-hidden="true">⌂</span>
              <p>
                <strong>답변 가능한 질문을 확인해 주세요.</strong> 직접
                확인했거나 근거가 있는 내용만 남길 수 있어요.
              </p>
            </div>
          )}
          <div className="roomTabs" role="tablist" aria-label="질문 상태">
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
          {connectionState !== 'connected' && (
            <div className="connectionNotice" role="status">
              실시간 연결을 복구하고 있어요. 연결되면 최신 질문을 다시
              확인합니다.
            </div>
          )}
          <QuestionFeed roomSlug={room.slug} status={status} />
        </section>

        {room.access.canAskQuestion && composerOpen && (
          <aside className="roomComposerColumn" aria-label="질문 작성">
            <QuestionComposer
              roomSlug={room.slug}
              onCreated={() => setComposerOpen(false)}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
