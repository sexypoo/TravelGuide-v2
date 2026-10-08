'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removePlaceFavorite } from '@/lib/api/place-favorites';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { usePlaceFavorites } from '@/lib/query/use-place-favorites';
import { AppIcon } from '@/components/common';
import styles from '@/components/profile/profile.module.css';

export function SavedPlacesList(): React.JSX.Element {
  const favorites = usePlaceFavorites();
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: removePlaceFavorite,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.placeFavorites }),
  });

  if (favorites.isPending) {
    return <p className={styles.state}>찜한 장소를 불러오는 중이에요.</p>;
  }
  if (favorites.isError) {
    return (
      <div className={styles.state} role="alert">
        <strong>찜한 장소를 불러오지 못했어요</strong>
        <button
          className={styles.textButton}
          type="button"
          onClick={() => void favorites.refetch()}
        >
          다시 불러오기
        </button>
      </div>
    );
  }
  if (favorites.data.length === 0) {
    return (
      <p className={styles.state}>
        <strong>아직 찜한 장소가 없어요</strong>
        실시간방에서 받은 장소 카드의 찜 버튼을 눌러 보세요.
      </p>
    );
  }

  return (
    <>
      <ul className={`${styles.rows} ${styles.shortcuts}`}>
        {favorites.data.map((favorite) => (
          <li key={favorite.id}>
            <article className={styles.place}>
              <h2>{favorite.name}</h2>
              {favorite.address && <p>{favorite.address}</p>}
              <div>
                <a
                  className={styles.mapLink}
                  href={`https://maps.google.com/?q=${favorite.latitude},${favorite.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  지도에서 보기 <AppIcon name="external" />
                </a>
                <button
                  className={styles.textButton}
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(favorite.id)}
                >
                  찜 해제
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {remove.isError && (
        <p className={styles.error} role="alert">
          {actionableErrorMessage(remove.error, '찜을 해제하지 못했어요.')}
        </p>
      )}
    </>
  );
}
