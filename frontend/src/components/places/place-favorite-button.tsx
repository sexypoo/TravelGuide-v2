'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  removePlaceFavorite,
  savePlaceFavorite,
} from '@/lib/api/place-favorites';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { usePlaceFavorites } from '@/lib/query/use-place-favorites';
import { AppIcon } from '@/components/common';
import { useMessages } from '@/i18n/client';
import styles from './favorite.module.css';

export function PlaceFavoriteButton({
  messageId,
  placeName,
}: {
  messageId: string;
  placeName: string;
}): React.JSX.Element {
  const favorites = usePlaceFavorites();
  const copy = useMessages().places.favorite;
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
  const label = saved === undefined ? copy.save : copy.saved;

  return (
    <span className={`${styles.control} placeFavoriteControl`}>
      <button
        type="button"
        className={styles.button}
        aria-label={
          saved === undefined
            ? copy.saveLabel(placeName)
            : copy.removeLabel(placeName)
        }
        aria-pressed={saved !== undefined}
        disabled={favorites.isPending || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        <AppIcon name={saved === undefined ? 'heart' : 'heart-filled'} />
        {mutation.isPending ? copy.saving : label}
      </button>
      {mutation.isError && (
        <small className={styles.error} role="alert">
          {actionableErrorMessage(mutation.error, copy.saveFailed)}
        </small>
      )}
    </span>
  );
}
