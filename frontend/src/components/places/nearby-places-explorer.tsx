'use client';

import { useEffect, useRef, useState } from 'react';
import { getNearbyOpenRestaurants, type GooglePlace } from '@/lib/api/places';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { loadGoogleMaps } from '@/lib/maps/google-maps-loader';
import { AppIcon } from '@/components/common';
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
    <section className={styles.page} aria-labelledby="nearby-title">
      <header className={styles.header}>
        <h1 id="nearby-title">지금 문 연 식당</h1>
        <p id="nearby-lede">
          현재 위치에서 1.5km 안의 영업 중 식당을 가까운 순서로 보여줘요.
        </p>
        <button
          className={styles.search}
          type="button"
          disabled={loading}
          onClick={findNearby}
        >
          <AppIcon name="pin" />
          {loading
            ? '주변을 찾는 중…'
            : hasSearched
              ? '현재 위치로 다시 찾기'
              : '내 주변 보기'}
        </button>
      </header>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.content}>
        {apiKey.length === 0 ? (
          <div className={styles.map} data-unavailable>
            <p>
              지도를 표시할 수 없어요.
              <br />
              가까운 식당은 목록으로 확인할 수 있어요.
            </p>
          </div>
        ) : (
          <div
            ref={mapElement}
            className={styles.map}
            aria-label="내 주변 영업 중 식당 지도"
          />
        )}

        <div className={styles.results} aria-live="polite">
          {!hasSearched ? (
            <p className={styles.status}>
              내 주변 보기를 누르면 가까운 식당이 여기에 나와요.
            </p>
          ) : loading ? (
            <p className={styles.status}>가까운 식당을 찾고 있어요…</p>
          ) : places.length === 0 ? (
            <p className={styles.status}>
              1.5km 안에 영업 중인 식당이 없어요. 조금 이동한 뒤 다시 찾아
              보세요.
            </p>
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
                      <span>
                        <strong>{place.name}</strong>
                        <span>
                          {place.address ?? place.category ?? '주소 정보 없음'}
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
      </div>
      <p className={styles.privacy}>
        현재 위치는 검색에만 쓰고 서버에 저장하지 않아요.
      </p>
    </section>
  );
}
