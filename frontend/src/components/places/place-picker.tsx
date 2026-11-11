'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { searchPlaces, type GooglePlace } from '@/lib/api/places';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { loadGoogleMaps } from '@/lib/maps/google-maps-loader';
import { AppIcon } from '@/components/common';
import { Button, IconButton, Notice } from '@/components/ui';
import { useMessages } from '@/i18n/client';
import styles from './place-picker.module.css';

export interface PlacePickerCenter {
  latitude: number;
  longitude: number;
}

export function PlacePicker({
  center,
  onClose,
  onSelect,
}: {
  /** Opening map center and search bias: the current room's destination. */
  center: PlacePickerCenter;
  onClose: () => void;
  onSelect: (place: GooglePlace) => void;
}): React.JSX.Element {
  const dialogElement = useRef<HTMLElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<TravelGuideGoogleMap | undefined>(undefined);
  const marker = useRef<TravelGuideGoogleMarker | undefined>(undefined);
  const latestSearchId = useRef(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GooglePlace[]>([]);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [selected, setSelected] = useState<GooglePlace>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const t = useMessages();
  const copy = t.places.picker;
  const mapLoadFailed = copy.mapLoadFailed;
  // The map only reads its starting center once, when it is created.
  const initialCenter = useRef(center);

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
          center: {
            lat: initialCenter.current.latitude,
            lng: initialCenter.current.longitude,
          },
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
        });
      })
      .catch(() => setError(mapLoadFailed));
    return () => {
      active = false;
      marker.current?.setMap(null);
    };
  }, [apiKey, mapLoadFailed]);

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
      setError(copy.queryTooShort);
      return;
    }
    const trimmedQuery = query.trim();
    // Only the most recently started search may update the screen.
    const searchId = latestSearchId.current + 1;
    latestSearchId.current = searchId;
    setLoading(true);
    setError('');
    try {
      const places = await searchPlaces(trimmedQuery, {
        latitude: center.latitude,
        longitude: center.longitude,
      });
      if (searchId !== latestSearchId.current) return;
      setResults(places);
      setSearchedQuery(trimmedQuery);
    } catch (searchError: unknown) {
      if (searchId !== latestSearchId.current) return;
      setResults([]);
      setSearchedQuery('');
      setError(actionableErrorMessage(searchError, copy.searchFailed));
    } finally {
      if (searchId === latestSearchId.current) setLoading(false);
    }
  }

  const picker = (
    <div
      className={`${styles.backdrop} placePickerBackdrop`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogElement}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-picker-title"
        aria-describedby="place-picker-description"
      >
        <header className={styles.header}>
          <span className={styles.grabber} aria-hidden="true" />
          <div className={styles.headerText}>
            <h2 id="place-picker-title">{copy.title}</h2>
            <p id="place-picker-description">{copy.description}</p>
          </div>
          <IconButton icon="close" label={copy.close} onClick={onClose} />
        </header>

        <div className={`${styles.search} placePickerSearch`}>
          <label className={styles.searchField}>
            <AppIcon name="search" />
            <input
              ref={searchInput}
              value={query}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchLabel}
              enterKeyHint="search"
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchedQuery('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void runSearch();
                }
              }}
            />
          </label>
          <Button disabled={loading} onClick={() => void runSearch()}>
            {copy.search}
          </Button>
        </div>

        {error && (
          <div className={styles.error}>
            <Notice tone="danger" icon="alert" role="alert">
              {error}
            </Notice>
          </div>
        )}

        <div className={`${styles.workspace} placePickerWorkspace`}>
          <section
            className={styles.resultPane}
            aria-labelledby="place-picker-results-title"
          >
            <header className={styles.paneHead}>
              <strong id="place-picker-results-title">
                {copy.resultsTitle}
              </strong>
              <span>
                {results.length > 0 || searchedQuery.length > 0
                  ? copy.resultsCount(results.length)
                  : copy.resultsHint}
              </span>
            </header>
            <div className={styles.results} aria-live="polite">
              {loading ? (
                <p className={styles.resultsState}>{copy.searching}</p>
              ) : results.length === 0 && searchedQuery.length > 0 ? (
                <p className={styles.resultsState}>
                  {copy.noResults(searchedQuery)}
                </p>
              ) : results.length === 0 ? (
                <p className={styles.resultsState}>{copy.startHint}</p>
              ) : (
                results.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    className={styles.result}
                    aria-pressed={selected?.id === place.id}
                    onClick={() => showPlace(place)}
                  >
                    <span className={styles.resultIcon} aria-hidden="true">
                      <AppIcon name="pin" />
                    </span>
                    <div className={styles.resultText}>
                      <strong>{place.name}</strong>
                      <small>
                        {place.address ?? place.category ?? t.places.noAddress}
                      </small>
                    </div>
                    {place.openNow !== null && (
                      <b
                        className={
                          place.openNow ? styles.open : styles.closedHours
                        }
                      >
                        {place.openNow ? copy.openNow : copy.closed}
                      </b>
                    )}
                  </button>
                ))
              )}
            </div>
          </section>

          <section
            className={styles.mapPane}
            aria-labelledby="place-picker-map-title"
          >
            <header className={styles.paneHead}>
              <strong id="place-picker-map-title">{copy.mapTitle}</strong>
              <span>{selected?.name ?? copy.mapHint}</span>
            </header>
            {apiKey.length === 0 ? (
              <div className={`${styles.map} ${styles.mapUnavailable}`}>
                <AppIcon name="map" />
                <p>{copy.mapNoKey}</p>
              </div>
            ) : (
              <div
                ref={mapElement}
                className={styles.map}
                aria-label={copy.mapLabel}
              />
            )}
          </section>
        </div>

        <footer className={styles.footer}>
          <div className={styles.selection} aria-live="polite">
            <span
              className={styles.selectionIcon}
              data-selected={selected !== undefined || undefined}
              aria-hidden="true"
            >
              <AppIcon name="pin" />
            </span>
            <div className={styles.resultText}>
              <strong>{selected?.name ?? copy.noSelection}</strong>
              <small>{selected?.address ?? copy.noSelectionHint}</small>
            </div>
          </div>
          <div className={styles.footerActions}>
            <Button variant="secondary" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button
              icon="check"
              disabled={selected === undefined}
              onClick={() => selected !== undefined && onSelect(selected)}
            >
              {selected === undefined ? copy.select : copy.send}
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );

  return createPortal(picker, document.body);
}
