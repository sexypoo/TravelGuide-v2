'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removePlaceFavorite } from '@/lib/api/place-favorites';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { usePlaceFavorites } from '@/lib/query/use-place-favorites';
import { AppIcon } from '@/components/common';
import { Button, Card, EmptyState, IconTile, Notice } from '@/components/ui';
import { useMessages } from '@/i18n/client';
import styles from './saved.module.css';

export function SavedPlacesList(): React.JSX.Element {
  const favorites = usePlaceFavorites();
  const t = useMessages();
  const copy = t.places.saved;
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: removePlaceFavorite,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.placeFavorites }),
  });

  if (favorites.isPending) {
    return (
      <div className={styles.stack}>
        <Card>
          <p className={styles.state} role="status">
            {copy.loading}
          </p>
        </Card>
      </div>
    );
  }
  if (favorites.isError) {
    return (
      <div className={styles.stack}>
        <Card>
          <div role="alert">
            <EmptyState
              icon="alert"
              title={copy.loadFailedTitle}
              description={copy.loadFailedDescription}
              action={
                <Button
                  variant="secondary"
                  icon="refresh"
                  onClick={() => void favorites.refetch()}
                >
                  {t.places.reload}
                </Button>
              }
            />
          </div>
        </Card>
      </div>
    );
  }
  if (favorites.data.length === 0) {
    return (
      <div className={styles.stack}>
        <Card>
          <EmptyState
            icon="heart"
            tone="magenta"
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <Card padding="list" aria-label={copy.listLabel}>
        <ul className={styles.list}>
          {favorites.data.map((favorite) => (
            <li key={favorite.id}>
              <article className={styles.place}>
                <IconTile icon="heart-filled" tone="magenta" />
                <div className={styles.text}>
                  <h2>{favorite.name}</h2>
                  {favorite.address && <p>{favorite.address}</p>}
                </div>
                <div className={styles.actions}>
                  <a
                    className={styles.mapLink}
                    href={`https://maps.google.com/?q=${favorite.latitude},${favorite.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy.viewOnMap} <AppIcon name="external" />
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(favorite.id)}
                  >
                    {copy.remove}
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Card>
      {remove.isError && (
        <Notice tone="danger" icon="alert" role="alert">
          {actionableErrorMessage(remove.error, copy.removeFailed)}
        </Notice>
      )}
    </div>
  );
}
