'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { shareTopicMessage, type MessagePage } from '@/lib/api/messages';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { mergeMessageIntoTimeline } from '@/lib/query/realtime-cache';

export function TopicShareButton({
  roomSlug,
  questionId,
}: {
  roomSlug: string;
  questionId: string;
}): React.JSX.Element {
  const queryClient = useQueryClient();
  const [sent, setSent] = useState(false);
  const mutation = useMutation({
    mutationFn: () => shareTopicMessage(roomSlug, questionId),
    onSuccess: (message) => {
      queryClient.setQueryData<InfiniteData<MessagePage>>(
        queryKeys.roomMessages(roomSlug),
        (current) => mergeMessageIntoTimeline(current, message),
      );
      setSent(true);
    },
  });

  return (
    <div className="topicShareAction">
      <button
        className="iconTextControl"
        type="button"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        <AppIcon name="send" />
        {mutation.isPending
          ? '공유 중'
          : sent
            ? '채팅에 다시 공유하기'
            : '채팅에 공유하기'}
      </button>
      {mutation.isError && (
        <span role="alert">
          {actionableErrorMessage(mutation.error, '토픽을 보내지 못했어요.')}
        </span>
      )}
    </div>
  );
}
