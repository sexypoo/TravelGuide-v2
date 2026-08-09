'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  removePlaceFavorite,
  savePlaceFavorite,
} from '@/lib/api/place-favorites';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { usePlaceFavorites } from '@/lib/query/use-place-favorites';

export function PlaceFavoriteButton({
  messageId,
  placeName,
}: {
  messageId: string;
  placeName: string;
}): React.JSX.Element {
  const favorites = usePlaceFavorites();
  const queryClient = useQueryClient();
  const saved = favorites.data?.find(
    (favorite) => favorite.sourceMessageId === messageId,
  );
  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (saved === undefined) {
        await savePlaceFavorite(messageId);
      } else {
        await removePlaceFavorite(saved.id);
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.placeFavorites }),
  });
  const label = saved === undefined ? '찜하기' : '찜했어요';

  return (
    <span className="placeFavoriteControl">
      <button
        type="button"
        className={saved === undefined ? '' : 'isSaved'}
        aria-label={`${placeName} ${saved === undefined ? '찜하기' : '찜 해제'}`}
        aria-pressed={saved !== undefined}
        disabled={favorites.isPending || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        <span aria-hidden="true">{saved === undefined ? '♡' : '♥'}</span>
        {mutation.isPending ? '저장 중' : label}
      </button>
      {mutation.isError && (
        <small role="alert">
          {actionableErrorMessage(mutation.error, '장소를 저장하지 못했어요.')}
        </small>
      )}
    </span>
  );
}
