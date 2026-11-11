'use client';

import { useEffect, useRef, useState } from 'react';
import { getNearbyOpenRestaurants, type GooglePlace } from '@/lib/api/places';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import { loadGoogleMaps } from '@/lib/maps/google-maps-loader';
import { AppIcon } from '@/components/common';
import { Button, Card, EmptyState, IconTile, Notice } from '@/components/ui';
import { useMessages } from '@/i18n/client';
import type { Messages } from '@/i18n/messages';
import styles from './nearby.module.css';

const DEFAULT_CENTER = { latitude: 37.5665, longitude: 126.978 };

function placeMapUrl(place: GooglePlace): string {
  return (
    place.googleMapsUri ??
    `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}&query_place_id=${encodeURIComponent(place.id)}`
  );
}

function locationFailure(
  error: GeolocationPositionError,
  copy: Messages['places']['nearby'],
): string {
  if (error.code === error.PERMISSION_DENIED) return copy.locationDenied;
  if (error.code === error.TIMEOUT) return copy.locationTimeout;
  return copy.locationUnavailable;
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
  const t = useMessages();
  const copy = t.places.nearby;
  const mapLoadFailed = copy.mapLoadFailed;

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
      .catch(() => setError(mapLoadFailed));
    return () => {
      active = false;
      markers.current.forEach((marker) => marker.setMap(null));
    };
  }, [apiKey, mapLoadFailed]);

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
    // A new search must never leave the previous location's list or markers
    // on screen, so a failed re-search shows the failure state instead.
    setPlaces([]);
    setSelectedId(undefined);
    if (!navigator.geolocation) {
      setError(copy.noGeolocation);
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
            setError(actionableErrorMessage(cause, copy.searchFailed)),
          )
          .finally(() => setLoading(false));
      },
      (cause) => {
        setLoading(false);
        setError(locationFailure(cause, copy));
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
      <Card className={styles.locate} aria-label={copy.locateLabel}>
        <div className={styles.locateText}>
          <IconTile icon="pin" tone="iris" />
          <div>
            <h2>{copy.locateHeading}</h2>
            <p>{copy.locateDescription}</p>
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
            ? copy.searching
            : hasSearched
              ? copy.searchAgain
              : copy.searchStart}
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
                title={copy.mapUnavailableTitle}
                description={copy.mapUnavailableDescription}
              />
            </div>
          ) : (
            <div
              ref={mapElement}
              className={styles.map}
              aria-label={copy.mapLabel}
            />
          )}
        </Card>

        <Card padding="none" className={styles.results}>
          <div aria-live="polite">
            {!hasSearched ? (
              <EmptyState
                icon="search"
                title={copy.idleTitle}
                description={copy.idleDescription}
              />
            ) : loading ? (
              <p className={styles.status}>{copy.loadingList}</p>
            ) : places.length === 0 && error ? (
              <EmptyState
                icon="alert"
                title={copy.listFailedTitle}
                description={copy.listFailedDescription}
              />
            ) : places.length === 0 ? (
              <EmptyState
                icon="pin"
                title={copy.emptyTitle}
                description={copy.emptyDescription}
              />
            ) : (
              <>
                <h2 className={styles.resultsHeading}>
                  {copy.resultsHeading}{' '}
                  <span>{copy.resultsCount(places.length)}</span>
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
                              t.places.noAddress}
                          </span>
                        </span>
                      </button>
                      <a
                        className={styles.external}
                        href={placeMapUrl(place)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={copy.openInGoogleMaps(place.name)}
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
