'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { searchPlaces, type GooglePlace } from '@/lib/api/places';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { loadGoogleMaps } from '@/lib/maps/google-maps-loader';
import { AppIcon } from '@/components/common';

const JEJU_CENTER = { latitude: 33.4996, longitude: 126.5312 };

export function PlacePicker({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (place: GooglePlace) => void;
}): React.JSX.Element {
  const dialogElement = useRef<HTMLElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<TravelGuideGoogleMap | undefined>(undefined);
  const marker = useRef<TravelGuideGoogleMarker | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GooglePlace[]>([]);
  const [selected, setSelected] = useState<GooglePlace>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() =>
      searchInput.current?.focus(),
    );

    function handleDialogKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || dialogElement.current === null) return;

      const focusable = Array.from(
        dialogElement.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleDialogKeydown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleDialogKeydown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [onClose]);

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
      setResults(await searchPlaces(query.trim(), JEJU_CENTER));
    } catch (searchError: unknown) {
      setError(actionableErrorMessage(searchError, '장소를 찾지 못했어요.'));
    } finally {
      setLoading(false);
    }
  }

  const picker = (
    <div
      className="placePickerBackdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogElement}
        className="placePicker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-picker-title"
        aria-describedby="place-picker-description"
      >
        <header>
          <div>
            <h2 id="place-picker-title">장소 보내기</h2>
            <p id="place-picker-description">
              이름으로 찾고 지도 위치를 확인한 뒤 공유하세요.
            </p>
          </div>
          <button
            className="iconOnlyControl"
            type="button"
            onClick={onClose}
            aria-label="장소 선택 닫기"
          >
            <AppIcon name="close" />
          </button>
        </header>

        <div className="placePickerSearch">
          <input
            ref={searchInput}
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
            className="iconTextControl"
            type="button"
            disabled={loading}
            onClick={() => void runSearch()}
          >
            검색
          </button>
        </div>

        <div className="placePickerWorkspace">
          <section
            className="placePickerResultPane"
            aria-labelledby="place-picker-results-title"
          >
            <header>
              <strong id="place-picker-results-title">검색 결과</strong>
              <span>
                {results.length > 0
                  ? `${results.length}곳`
                  : '장소 이름을 입력하세요'}
              </span>
            </header>
            <div className="placePickerResults" aria-live="polite">
              {loading ? (
                <p>장소를 찾고 있어요…</p>
              ) : results.length === 0 ? (
                <p>보내고 싶은 장소를 검색해 보세요.</p>
              ) : (
                results.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    className={selected?.id === place.id ? 'isSelected' : ''}
                    aria-pressed={selected?.id === place.id}
                    onClick={() => showPlace(place)}
                  >
                    <span aria-hidden="true">
                      <AppIcon name="pin" />
                    </span>
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
          </section>

          <section
            className="placePickerMapPane"
            aria-labelledby="place-picker-map-title"
          >
            <header>
              <strong id="place-picker-map-title">지도 미리보기</strong>
              <span>{selected?.name ?? '선택한 장소가 여기에 표시돼요'}</span>
            </header>
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
          </section>
        </div>
        {error && (
          <p className="placePickerError" role="alert">
            {error}
          </p>
        )}
        <footer>
          <div className="placePickerSelection" aria-live="polite">
            <span aria-hidden="true">
              <AppIcon name="pin" />
            </span>
            <div>
              <strong>{selected?.name ?? '아직 선택한 장소가 없어요'}</strong>
              <small>
                {selected?.address ??
                  '검색 결과에서 장소를 선택하면 바로 보낼 수 있어요.'}
              </small>
            </div>
          </div>
          <div className="placePickerFooterActions">
            <button type="button" onClick={onClose}>
              취소
            </button>
            <button
              type="button"
              disabled={selected === undefined}
              onClick={() => selected !== undefined && onSelect(selected)}
            >
              <AppIcon name="check" />
              {selected === undefined ? '장소 선택' : '이 장소 보내기'}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );

  return createPortal(picker, document.body);
}
