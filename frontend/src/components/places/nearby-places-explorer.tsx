'use client';

import { useEffect, useRef, useState } from 'react';
import { getNearbyOpenRestaurants, type GooglePlace } from '@/lib/api/places';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { loadGoogleMaps } from '@/lib/maps/google-maps-loader';
import { AppIcon } from '@/components/common';
import { Button, Card, EmptyState, IconTile, Notice } from '@/components/ui';
import styles from './nearby.module.css';

const DEFAULT_CENTER = { latitude: 37.5665, longitude: 126.978 };

function placeMapUrl(place: GooglePlace): string {
  return (
    place.googleMapsUri ??
    `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}&query_place_id=${encodeURIComponent(place.id)}`
  );
}

export function NearbyPlacesExplorer(): React.JSX.Element {
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<TravelGuideGoogleMap | undefined>(undefined);
  const markers = useRef<TravelGuideGoogleMarker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  useEffect(() => {
    if (apiKey.length === 0 || mapElement.current === null) return;
    let active = true;
    void loadGoogleMaps(apiKey)
      .then((google) => {
        if (!active || mapElement.current === null) return;
        map.current = new google.maps.Map(mapElement.current, {
          center: {
            lat: DEFAULT_CENTER.latitude,
            lng: DEFAULT_CENTER.longitude,
          },
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
        });
        setMapReady(true);
      })
      .catch(() =>
        setError(
          '지도를 불러오지 못했어요. 가까운 식당은 목록으로 확인할 수 있어요.',
        ),
      );
    return () => {
      active = false;
      markers.current.forEach((marker) => marker.setMap(null));
    };
  }, [apiKey]);

  useEffect(() => {
    const currentMap = map.current;
    const google = window.google;
    if (!mapReady || currentMap === undefined || google === undefined) return;
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = places.map(
      (place, index) =>
        new google.maps.Marker({
          map: currentMap,
          position: { lat: place.latitude, lng: place.longitude },
          title: place.name,
          label: String(index + 1),
        }),
    );
  }, [mapReady, places]);

  function findNearby(): void {
    if (!navigator.geolocation) {
      setError('이 브라우저에서는 현재 위치를 확인할 수 없어요.');
      return;
    }
    setLoading(true);
    setHasSearched(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const current = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        map.current?.setCenter({
          lat: current.latitude,
          lng: current.longitude,
        });
        map.current?.setZoom(15);
        void getNearbyOpenRestaurants(current)
          .then((items) => {
            setPlaces(items);
            setSelectedId(items[0]?.id);
          })
          .catch((cause: unknown) =>
            setError(
              actionableErrorMessage(cause, '근처 식당을 찾지 못했어요.'),
            ),
          )
          .finally(() => setLoading(false));
      },
      () => {
        setLoading(false);
        setError('위치 권한을 허용한 뒤 다시 시도해 주세요.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function focusPlace(place: GooglePlace): void {
    setSelectedId(place.id);
    map.current?.setCenter({ lat: place.latitude, lng: place.longitude });
    map.current?.setZoom(17);
  }

  return (
    <div className={styles.layout}>
      <Card className={styles.locate} aria-label="현재 위치로 찾기">
        <div className={styles.locateText}>
          <IconTile icon="pin" tone="iris" />
          <div>
            <h2>현재 위치로 찾아요</h2>
            <p>
              버튼을 누르면 위치 권한을 물어봐요. 위치는 검색에만 쓰고 서버에
              저장하지 않아요.
            </p>
          </div>
        </div>
        <Button
          size="lg"
          block
          icon="pin"
          disabled={loading}
          onClick={findNearby}
        >
          {loading
            ? '주변을 찾는 중…'
            : hasSearched
              ? '현재 위치로 다시 찾기'
              : '내 주변 보기'}
        </Button>
      </Card>

      {error && (
        <Notice tone="danger" icon="alert" role="alert">
          {error}
        </Notice>
      )}

      <div className={styles.content}>
        <Card padding="none" className={styles.mapCard}>
          {apiKey.length === 0 ? (
            <div className={styles.mapFallback} data-unavailable>
              <EmptyState
                icon="map"
                title="지도를 표시할 수 없어요"
                description="가까운 식당은 목록으로 확인할 수 있어요."
              />
            </div>
          ) : (
            <div
              ref={mapElement}
              className={styles.map}
              aria-label="내 주변 영업 중 식당 지도"
            />
          )}
        </Card>

        <Card padding="none" className={styles.results}>
          <div aria-live="polite">
            {!hasSearched ? (
              <EmptyState
                icon="search"
                title="아직 찾아본 곳이 없어요"
                description="내 주변 보기를 누르면 가까운 식당이 여기에 나와요."
              />
            ) : loading ? (
              <p className={styles.status}>가까운 식당을 찾고 있어요…</p>
            ) : places.length === 0 && error ? (
              <EmptyState
                icon="alert"
                title="목록을 불러오지 못했어요"
                description="위 안내를 확인한 뒤 다시 찾아 보세요."
              />
            ) : places.length === 0 ? (
              <EmptyState
                icon="pin"
                title="근처에 문 연 식당이 없어요"
                description="1.5km 안에 영업 중인 식당이 없어요. 조금 이동한 뒤 다시 찾아 보세요."
              />
            ) : (
              <>
                <h2 className={styles.resultsHeading}>
                  가까운 순서 <span>{places.length}곳</span>
                </h2>
                <ol className={styles.list}>
                  {places.map((place, index) => (
                    <li
                      key={place.id}
                      data-selected={selectedId === place.id || undefined}
                    >
                      <button
                        type="button"
                        className={styles.place}
                        onClick={() => focusPlace(place)}
                        aria-pressed={selectedId === place.id}
                      >
                        <span className={styles.rank} aria-hidden="true">
                          {index + 1}
                        </span>
                        <span className={styles.placeText}>
                          <strong>{place.name}</strong>
                          <span>
                            {place.address ??
                              place.category ??
                              '주소 정보 없음'}
                          </span>
                        </span>
                      </button>
                      <a
                        className={styles.external}
                        href={placeMapUrl(place)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${place.name} Google 지도에서 보기`}
                      >
                        <AppIcon name="external" />
                      </a>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
