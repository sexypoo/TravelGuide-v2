'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { useLocale, useMessages } from '@/i18n/client';
import type { Messages } from '@/i18n/messages';
import type { LocalProofType } from '@/lib/api/verifications';
import { submitLocalVerification } from '@/lib/api/verifications';
import { destinationName } from '@/lib/verifications/presentation';
import { applicationError, proofError } from './verification-form-utils';
import { Button } from '@/components/ui';
import {
  ConsentCard,
  FormCard,
  FormFooter,
  PrepareCard,
  ProofPicker,
} from './verification-form-parts';
import styles from './verification.module.css';

interface CapturedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
}

type LocateState = 'idle' | 'locating' | 'done' | 'error';

function distanceKm(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
): number {
  const radians = (degrees: number): number => (degrees * Math.PI) / 180;
  const latitude = radians(second.latitude - first.latitude);
  const longitude = radians(second.longitude - first.longitude);
  const value =
    Math.sin(latitude / 2) ** 2 +
    Math.cos(radians(first.latitude)) *
      Math.cos(radians(second.latitude)) *
      Math.sin(longitude / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(value));
}

// The API and the Decimal(9, 6) columns accept at most 6 decimal places
// (about 0.1 m); browsers report far more precision than that.
function toCoordinate(degrees: number): number {
  return Number(degrees.toFixed(6));
}

function locationFailure(
  error: GeolocationPositionError,
  t: Messages['verifications']['local'],
): string {
  if (error.code === error.PERMISSION_DENIED) return t.permissionDenied;
  if (error.code === error.TIMEOUT) return t.timeout;
  return t.unavailable;
}

export function LocalVerificationForm({
  destination,
}: {
  destination: {
    id: string;
    slug?: string;
    nameKo: string;
    center: { latitude: number; longitude: number };
    radiusKm: number;
  };
}): React.JSX.Element {
  const router = useRouter();
  const messages = useMessages().verifications;
  const t = messages.local;
  const city = destinationName(destination, useLocale());
  const [location, setLocation] = useState<CapturedLocation>();
  const [locationMessage, setLocationMessage] = useState<string>();
  const [locating, setLocating] = useState(false);
  const [proofType, setProofType] = useState<LocalProofType>('RESIDENCE');
  const [note, setNote] = useState('');
  const [proof, setProof] = useState<File>();
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  function captureLocation(): void {
    setLocation(undefined);
    setLocationMessage(undefined);
    if (!('geolocation' in navigator)) {
      setLocationMessage(t.unsupported);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        if (position.coords.accuracy > 200) {
          setLocationMessage(
            t.lowAccuracy(Math.round(position.coords.accuracy)),
          );
          return;
        }
        const captured = {
          latitude: toCoordinate(position.coords.latitude),
          longitude: toCoordinate(position.coords.longitude),
          accuracy: position.coords.accuracy,
          capturedAt: new Date(position.timestamp).toISOString(),
        };
        if (distanceKm(captured, destination.center) > destination.radiusKm) {
          setLocationMessage(t.outside(city));
          return;
        }
        setLocation(captured);
        setLocationMessage(t.inside(city, Math.round(captured.accuracy)));
      },
      (positionError) => {
        setLocating(false);
        setLocationMessage(locationFailure(positionError, t));
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 },
    );
  }

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const fileError = proofError(proof, messages.form);
    if (location === undefined) return setError(t.locationFirst(city));
    if (note.trim().length < 30) return setError(t.noteTooShort(city));
    if (fileError !== undefined) return setError(fileError);
    if (!consent) return setError(messages.form.consentMissing);
    const data = new FormData();
    data.set('destinationId', destination.id);
    data.set('latitude', String(location.latitude));
    data.set('longitude', String(location.longitude));
    data.set('accuracyMeters', String(Math.round(location.accuracy)));
    data.set('capturedAt', location.capturedAt);
    data.set('localProofType', proofType);
    data.set('note', note.trim());
    if (proof !== undefined) data.set('proofFile', proof);
    setPending(true);
    setError(undefined);
    try {
      await submitLocalVerification(data);
      router.push('/app/verifications?submitted=local');
      router.refresh();
    } catch (caught: unknown) {
      setError(applicationError(caught, messages));
      setPending(false);
    }
  }

  const located = location !== undefined;
  const locateState: LocateState = locating
    ? 'locating'
    : located
      ? 'done'
      : locationMessage !== undefined
        ? 'error'
        : 'idle';

  return (
    <form
      method="post"
      className={styles.form}
      onSubmit={(event) => void submit(event)}
      noValidate
      data-verification-form
    >
      <PrepareCard
        items={[
          {
            icon: 'pin',
            title: t.prepareLocation,
            text: t.prepareLocationText(city),
          },
          {
            icon: 'notebook',
            title: t.prepareProof,
            text: t.prepareProofText,
          },
        ]}
      />
      <FormCard
        title={t.locationTitle}
        description={t.locationDescription(city, destination.radiusKm)}
      >
        <div className={styles.locate} data-state={locateState} role="status">
          <span className={styles.locateIcon} aria-hidden="true">
            <AppIcon
              name={
                locateState === 'done'
                  ? 'check'
                  : locateState === 'error'
                    ? 'alert'
                    : 'pin'
              }
            />
          </span>
          <span className={styles.locateText}>
            <strong>{t.locateStates[locateState]}</strong>
            <small>{locationMessage ?? t.locationHint}</small>
          </span>
        </div>
        <Button
          variant={located ? 'secondary' : 'primary'}
          block
          icon={located ? 'refresh' : 'pin'}
          onClick={captureLocation}
          disabled={locating}
        >
          {locating
            ? t.locating
            : location === undefined
              ? t.locate
              : t.relocate}
        </Button>
      </FormCard>
      <FormCard title={t.tiesTitle} description={t.tiesDescription}>
        <label className={styles.field}>
          <span className={styles.label}>{t.proofType}</span>
          <span className={styles.selectFrame}>
            <select
              value={proofType}
              onChange={(e) => setProofType(e.target.value as LocalProofType)}
            >
              <option value="RESIDENCE">{t.proofTypes.RESIDENCE}</option>
              <option value="WORK">{t.proofTypes.WORK}</option>
              <option value="STUDY">{t.proofTypes.STUDY}</option>
              <option value="OTHER">{t.proofTypes.OTHER}</option>
            </select>
            <AppIcon name="chevron-right" className={styles.selectChevron} />
          </span>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>
            {t.note} <small>{note.length}/300</small>
          </span>
          <textarea
            maxLength={300}
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.notePlaceholder(city)}
          />
        </label>
        <ProofPicker label={t.proofLabel} file={proof} onChange={setProof} />
      </FormCard>
      <ConsentCard
        checked={consent}
        onChange={setConsent}
        title={t.consentTitle}
      >
        {t.consentBody}
      </ConsentCard>
      <FormFooter error={error} pending={pending} label={t.submit} />
    </form>
  );
}
