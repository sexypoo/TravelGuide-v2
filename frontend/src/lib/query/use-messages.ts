'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getMessagePage, type ChatMessage } from '../api/messages';
import { queryKeys } from './keys';

export function useMessages(roomSlug: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.roomMessages(roomSlug),
    queryFn: ({ pageParam }) =>
      getMessagePage(roomSlug, pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    select: (data) => {
      const seen = new Set<string>();
      const messages: ChatMessage[] = [];
      for (const page of [...data.pages].reverse()) {
        for (const message of page.items) {
          if (!seen.has(message.id)) {
            seen.add(message.id);
            messages.push(message);
          }
        }
      }
      return { ...data, messages };
    },
  });
}
