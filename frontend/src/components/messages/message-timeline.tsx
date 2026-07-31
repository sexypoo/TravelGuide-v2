'use client';

import type { ChatMessage } from '@/lib/api/messages';
import { formatChatDate } from '@/lib/questions/presentation';
import { useMessages } from '@/lib/query/use-messages';
import { MessageCard } from './message-card';

function dateKey(value: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export function MessageTimeline({
  roomSlug,
  currentUserId,
  onPromote,
}: {
  roomSlug: string;
  currentUserId: string;
  onPromote: (message: ChatMessage) => void;
}): React.JSX.Element {
  const query = useMessages(roomSlug);

  if (query.isPending) {
    return (
      <div className="messageTimelineSkeleton" aria-label="대화를 불러오는 중">
        <span />
        <span />
        <span />
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="chatQueryState" role="alert">
        <strong>대화를 불러오지 못했어요</strong>
        <span>연결을 확인한 뒤 다시 시도해 주세요.</span>
        <button type="button" onClick={() => void query.refetch()}>
          다시 불러오기
        </button>
      </div>
    );
  }

  const messages = query.data.messages;
  return (
    <div className="messageTimeline" aria-label="제주방 대화">
      {query.hasNextPage && (
        <button
          className="olderMessagesButton"
          type="button"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          {query.isFetchingNextPage
            ? '이전 대화 불러오는 중'
            : '이전 대화 보기'}
        </button>
      )}
      {messages.length === 0 ? (
        <div className="chatEmptyState">
          <span aria-hidden="true">⌁</span>
          <strong>제주의 첫 대화를 시작해 보세요</strong>
          <p>지금 보고 들은 짧은 정보도 누군가의 다음 결정을 도울 수 있어요.</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const previous = messages[index - 1];
          const showDate =
            previous === undefined ||
            dateKey(previous.createdAt) !== dateKey(message.createdAt);
          return (
            <div key={message.id}>
              {showDate && (
                <div className="chatDateDivider">
                  <span>{formatChatDate(message.createdAt)}</span>
                </div>
              )}
              <MessageCard
                message={message}
                own={message.author.id === currentUserId}
                onPromote={onPromote}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
