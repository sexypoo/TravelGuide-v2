'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useState } from 'react';
import { createMessage, type MessagePage } from '@/lib/api/messages';
import { ApiProblem } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { mergeMessageIntoTimeline } from '@/lib/query/realtime-cache';

function messageError(error: unknown): string {
  if (error instanceof ApiProblem) return error.message;
  return '메시지를 보내지 못했습니다. 연결을 확인하고 다시 시도해 주세요.';
}

export function MessageComposer({
  roomSlug,
}: {
  roomSlug: string;
}): React.JSX.Element {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [clientError, setClientError] = useState('');
  const mutation = useMutation({
    mutationFn: (value: string) => createMessage(roomSlug, value),
    onSuccess: (message) => {
      queryClient.setQueryData<InfiniteData<MessagePage>>(
        queryKeys.roomMessages(roomSlug),
        (current) => mergeMessageIntoTimeline(current, message),
      );
      setContent('');
      setClientError('');
    },
  });

  function submit(): void {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      setClientError('공유할 내용을 입력해 주세요.');
      return;
    }
    setClientError('');
    mutation.mutate(trimmed);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!mutation.isPending) submit();
    }
  }

  const error =
    clientError || (mutation.isError ? messageError(mutation.error) : '');

  return (
    <form
      className="messageComposer"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label htmlFor="room-message">제주방에 메시지 보내기</label>
      <div>
        <textarea
          id="room-message"
          value={content}
          maxLength={500}
          rows={2}
          placeholder="지금 본 것, 궁금한 것, 도움이 될 정보를 나눠보세요"
          aria-invalid={error.length > 0}
          aria-describedby="room-message-help"
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="submit" disabled={mutation.isPending}>
          <span aria-hidden="true">↗</span>
          <span className="srOnly">
            {mutation.isPending ? '메시지 보내는 중' : '메시지 보내기'}
          </span>
        </button>
      </div>
      <footer id="room-message-help">
        <span>Enter 전송 · Shift+Enter 줄바꿈</span>
        <span>{Array.from(content).length}/500</span>
      </footer>
      {error.length > 0 && (
        <p role="alert" className="composerError">
          {error}
        </p>
      )}
    </form>
  );
}
