'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removePlaceFavorite } from '@/lib/api/place-favorites';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { usePlaceFavorites } from '@/lib/query/use-place-favorites';
import { AppIcon } from '@/components/common';
import { Button, Card, EmptyState, IconTile, Notice } from '@/components/ui';
import styles from './saved.module.css';

export function SavedPlacesList(): React.JSX.Element {
  const favorites = usePlaceFavorites();
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
            찜한 장소를 불러오는 중이에요.
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
              title="찜한 장소를 불러오지 못했어요"
              description="연결을 확인한 뒤 다시 시도해 주세요."
              action={
                <Button
                  variant="secondary"
                  icon="refresh"
                  onClick={() => void favorites.refetch()}
                >
                  다시 불러오기
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
            title="아직 찜한 장소가 없어요"
            description="실시간방에서 받은 장소 카드의 찜 버튼을 눌러 보세요."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <Card padding="list" aria-label="찜한 장소 목록">
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
                    지도에서 보기 <AppIcon name="external" />
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(favorite.id)}
                  >
                    찜 해제
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Card>
      {remove.isError && (
        <Notice tone="danger" icon="alert" role="alert">
          {actionableErrorMessage(remove.error, '찜을 해제하지 못했어요.')}
        </Notice>
      )}
    </div>
  );
}
