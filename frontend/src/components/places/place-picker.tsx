'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getNearbyOpenRestaurants,
  searchPlaces,
  type GooglePlace,
} from '@/lib/api/places';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { loadGoogleMaps } from '@/lib/maps/google-maps-loader';

const JEJU_CENTER = { latitude: 33.4996, longitude: 126.5312 };

export function PlacePicker({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (place: GooglePlace) => void;
}): React.JSX.Element {
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<TravelGuideGoogleMap | undefined>(undefined);
  const marker = useRef<TravelGuideGoogleMarker | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GooglePlace[]>([]);
  const [selected, setSelected] = useState<GooglePlace>();
  const [location, setLocation] = useState(JEJU_CENTER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  useEffect(() => {
    if (apiKey.length === 0 || mapElement.current === null) return;
    let active = true;
    void loadGoogleMaps(apiKey)
      .then((google) => {
        if (!active || mapElement.current === null) return;
        map.current = new google.maps.Map(mapElement.current, {
          center: { lat: JEJU_CENTER.latitude, lng: JEJU_CENTER.longitude },
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
        });
      })
      .catch(() => setError('지도를 불러오지 못했어요.'));
    return () => {
      active = false;
      marker.current?.setMap(null);
    };
  }, [apiKey]);

  function showPlace(place: GooglePlace): void {
    setSelected(place);
    const position = { lat: place.latitude, lng: place.longitude };
    map.current?.setCenter(position);
    map.current?.setZoom(16);
    marker.current?.setMap(null);
    if (window.google !== undefined && map.current !== undefined) {
      marker.current = new window.google.maps.Marker({
        map: map.current,
        position,
        title: place.name,
      });
    }
  }

  async function runSearch(): Promise<void> {
    if (query.trim().length < 2) {
      setError('장소 이름을 두 글자 이상 입력해 주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setResults(await searchPlaces(query.trim(), location));
    } catch (searchError: unknown) {
      setError(actionableErrorMessage(searchError, '장소를 찾지 못했어요.'));
    } finally {
      setLoading(false);
    }
  }

  function findNearby(): void {
    if (!navigator.geolocation) {
      setError('이 브라우저에서는 현재 위치를 확인할 수 없어요.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const current = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        setLocation(current);
        map.current?.setCenter({
          lat: current.latitude,
          lng: current.longitude,
        });
        map.current?.setZoom(14);
        void getNearbyOpenRestaurants(current)
          .then(setResults)
          .catch((nearbyError: unknown) =>
            setError(
              actionableErrorMessage(nearbyError, '근처 식당을 찾지 못했어요.'),
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

  return (
    <div className="placePickerBackdrop" role="presentation">
      <section
        className="placePicker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-picker-title"
      >
        <header>
          <div>
            <small>GOOGLE PLACES</small>
            <h2 id="place-picker-title">장소 보내기</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="장소 선택 닫기">
            ×
          </button>
        </header>

        <div className="placePickerSearch">
          <input
            value={query}
            placeholder="식당, 카페, 관광지를 검색하세요"
            aria-label="장소 검색어"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void runSearch();
              }
            }}
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => void runSearch()}
          >
            검색
          </button>
        </div>
        <button
          className="nearbyRestaurantButton"
          type="button"
          disabled={loading}
          onClick={findNearby}
        >
          <span aria-hidden="true">⌖</span> 현재 위치 근처 영업 중 식당
        </button>

        {apiKey.length === 0 ? (
          <div className="placePickerMap placePickerMap--unavailable">
            지도 API 키를 설정하면 지도가 표시됩니다.
          </div>
        ) : (
          <div
            ref={mapElement}
            className="placePickerMap"
            aria-label="장소 지도"
          />
        )}

        <div className="placePickerResults" aria-live="polite">
          {loading ? (
            <p>장소를 찾고 있어요…</p>
          ) : results.length === 0 ? (
            <p>검색하거나 현재 위치 근처 식당을 확인해 보세요.</p>
          ) : (
            results.map((place) => (
              <button
                key={place.id}
                type="button"
                className={selected?.id === place.id ? 'isSelected' : ''}
                onClick={() => showPlace(place)}
              >
                <span aria-hidden="true">⌖</span>
                <div>
                  <strong>{place.name}</strong>
                  <small>
                    {place.address ?? place.category ?? '주소 정보 없음'}
                  </small>
                </div>
                {place.openNow !== null && (
                  <b className={place.openNow ? 'isOpen' : ''}>
                    {place.openNow ? '영업 중' : '영업 종료'}
                  </b>
                )}
              </button>
            ))
          )}
        </div>
        {error && (
          <p className="placePickerError" role="alert">
            {error}
          </p>
        )}
        <footer>
          <button type="button" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            disabled={selected === undefined}
            onClick={() => selected !== undefined && onSelect(selected)}
          >
            {selected === undefined ? '장소를 선택하세요' : '이 장소 선택'}
          </button>
        </footer>
      </section>
    </div>
  );
}
