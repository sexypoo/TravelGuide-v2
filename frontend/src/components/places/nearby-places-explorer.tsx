'use client';

import { useEffect, useRef, useState } from 'react';
import { getNearbyOpenRestaurants, type GooglePlace } from '@/lib/api/places';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { loadGoogleMaps } from '@/lib/maps/google-maps-loader';

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
        setError('지도를 불러오지 못했어요. API 키 설정을 확인해 주세요.'),
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
      (place) =>
        new google.maps.Marker({
          map: currentMap,
          position: { lat: place.latitude, lng: place.longitude },
          title: place.name,
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
    <section className="nearbyExplorer" aria-labelledby="nearby-title">
      <header className="nearbyExplorer__hero">
        <div>
          <p>NEARBY, RIGHT NOW</p>
          <h1 id="nearby-title">
            지금 문 연 곳을
            <br />
            가볍게 찾아보세요
          </h1>
          <span>
            현재 위치에서 가까운 영업 중 식당을 지도와 함께 보여드려요.
          </span>
        </div>
        <button type="button" disabled={loading} onClick={findNearby}>
          <span aria-hidden="true">⌖</span>
          {loading
            ? '주변을 찾는 중…'
            : hasSearched
              ? '현재 위치로 다시 찾기'
              : '내 주변 보기'}
        </button>
      </header>

      {error && (
        <p className="nearbyExplorer__error" role="alert">
          {error}
        </p>
      )}

      <div className="nearbyExplorer__content">
        {apiKey.length === 0 ? (
          <div className="nearbyExplorer__map nearbyExplorer__map--unavailable">
            <strong>지도를 준비 중이에요</strong>
            <span>Google Maps API 키를 설정하면 지도가 표시됩니다.</span>
          </div>
        ) : (
          <div
            ref={mapElement}
            className="nearbyExplorer__map"
            aria-label="내 주변 영업 중 식당 지도"
          />
        )}

        <div className="nearbyExplorer__list" aria-live="polite">
          {!hasSearched ? (
            <div className="nearbyExplorer__empty">
              <span aria-hidden="true">⌖</span>
              <strong>현재 위치를 알려주세요</strong>
              <p>위치는 주변 검색에만 사용하고 저장하지 않아요.</p>
            </div>
          ) : loading ? (
            <div className="nearbyExplorer__empty">
              <strong>가까운 장소를 찾고 있어요…</strong>
            </div>
          ) : places.length === 0 ? (
            <div className="nearbyExplorer__empty">
              <strong>근처에서 영업 중인 식당을 찾지 못했어요.</strong>
            </div>
          ) : (
            <>
              <div className="nearbyExplorer__listHeading">
                <strong>가까운 순서</strong>
                <span>{places.length}곳</span>
              </div>
              {places.map((place, index) => (
                <article
                  key={place.id}
                  className={`nearbyPlaceCard${selectedId === place.id ? ' isSelected' : ''}`}
                >
                  <button
                    type="button"
                    className="nearbyPlaceCard__main"
                    onClick={() => focusPlace(place)}
                  >
                    <span className="nearbyPlaceCard__number">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <small>
                        <i aria-hidden="true" /> 영업 중
                      </small>
                      <strong>{place.name}</strong>
                      <span>
                        {place.address ?? place.category ?? '주소 정보 없음'}
                      </span>
                    </span>
                  </button>
                  <a
                    href={placeMapUrl(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${place.name} Google 지도에서 보기`}
                  >
                    ↗
                  </a>
                </article>
              ))}
            </>
          )}
        </div>
      </div>
      <p className="nearbyExplorer__privacy">
        <span aria-hidden="true">✓</span> 현재 위치는 검색에만 사용되며 서버에
        저장하지 않습니다.
      </p>
    </section>
  );
}
