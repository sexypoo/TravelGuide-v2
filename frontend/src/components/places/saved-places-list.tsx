'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removePlaceFavorite } from '@/lib/api/place-favorites';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { usePlaceFavorites } from '@/lib/query/use-place-favorites';
import { AppIcon } from '@/components/common';

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
      <div className="savedPlacesState">찜한 장소를 불러오는 중이에요.</div>
    );
  }
  if (favorites.isError) {
    return (
      <div className="savedPlacesState" role="alert">
        <strong>찜한 장소를 불러오지 못했어요</strong>
        <button type="button" onClick={() => void favorites.refetch()}>
          다시 불러오기
        </button>
      </div>
    );
  }
  if (favorites.data.length === 0) {
    return (
      <div className="savedPlacesState">
        <AppIcon name="heart" />
        <strong>아직 찜한 장소가 없어요</strong>
        <p>실시간방에서 받은 장소 카드의 찜 버튼을 눌러보세요.</p>
      </div>
    );
  }

  return (
    <div className="savedPlacesGrid">
      {favorites.data.map((favorite) => (
        <article key={favorite.id} className="savedPlaceCard">
          <span className="savedPlaceCard__pin" aria-hidden="true">
            <AppIcon name="pin" />
          </span>
          <div>
            <small>찜한 장소</small>
            <h2>{favorite.name}</h2>
            {favorite.address && <p>{favorite.address}</p>}
            <footer>
              <a
                href={`https://maps.google.com/?q=${favorite.latitude},${favorite.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                지도에서 보기 <AppIcon name="external" />
              </a>
              <button
                type="button"
                disabled={remove.isPending}
                onClick={() => remove.mutate(favorite.id)}
              >
                찜 해제
              </button>
            </footer>
          </div>
        </article>
      ))}
      {remove.isError && (
        <p className="savedPlacesError" role="alert">
          {actionableErrorMessage(remove.error, '찜을 해제하지 못했어요.')}
        </p>
      )}
    </div>
  );
}
