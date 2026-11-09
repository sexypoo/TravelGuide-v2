'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { useMessages } from '@/i18n/client';
import { shareTopicMessage, type MessagePage } from '@/lib/api/messages';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { mergeMessageIntoTimeline } from '@/lib/query/realtime-cache';
import styles from './topic-share-button.module.css';

export function TopicShareButton({
  roomSlug,
  questionId,
}: {
  roomSlug: string;
  questionId: string;
}): React.JSX.Element {
  const t = useMessages().topics.share;
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
    <div className={styles.action}>
      <button
        className={styles.button}
        type="button"
        disabled={mutation.isPending}
        aria-label={
          mutation.isPending
            ? t.sharingLabel
            : sent
              ? t.reshareLabel
              : t.shareLabel
        }
        onClick={() => mutation.mutate()}
      >
        <AppIcon name="send" />
        {mutation.isPending ? t.sharing : sent ? t.reshare : t.share}
      </button>
      {mutation.isError && (
        <span className={styles.error} role="alert">
          {actionableErrorMessage(mutation.error, t.failed)}
        </span>
      )}
    </div>
  );
}
