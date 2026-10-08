'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import type { LocalProofType } from '@/lib/api/verifications';
import { submitLocalVerification } from '@/lib/api/verifications';
import { applicationError, proofError } from './verification-form-utils';
import styles from './verification.module.css';

interface CapturedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
}

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

function locationFailure(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED)
    return '위치 권한이 꺼져 있어요. 브라우저 설정에서 위치 접근을 허용해 주세요.';
  if (error.code === error.TIMEOUT)
    return '위치 확인 시간이 초과됐어요. 열린 장소에서 다시 시도해 주세요.';
  return '현재 위치를 확인할 수 없어요. 기기의 위치 서비스를 확인해 주세요.';
}

export function LocalVerificationForm({
  destination,
}: {
  destination: {
    id: string;
    nameKo: string;
    center: { latitude: number; longitude: number };
    radiusKm: number;
  };
}): React.JSX.Element {
  const router = useRouter();
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
      setLocationMessage('이 브라우저에서는 위치 확인을 사용할 수 없어요.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        if (position.coords.accuracy > 200) {
          setLocationMessage(
            `정확도가 ${Math.round(position.coords.accuracy)}m예요. 200m 이내가 되도록 열린 장소에서 다시 확인해 주세요.`,
          );
          return;
        }
        const captured = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date(position.timestamp).toISOString(),
        };
        if (distanceKm(captured, destination.center) > destination.radiusKm) {
          setLocationMessage(
            '현재 위치가 제주 인증 범위 밖이에요. 제주 안에서 다시 확인해 주세요.',
          );
          return;
        }
        setLocation(captured);
        setLocationMessage(
          `제주 안에서 확인했어요. 정확도 ${Math.round(captured.accuracy)}m`,
        );
      },
      (positionError) => {
        setLocating(false);
        setLocationMessage(locationFailure(positionError));
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 },
    );
  }

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const fileError = proofError(proof);
    if (location === undefined)
      return setError('제주 안에서 현재 위치를 먼저 확인해 주세요.');
    if (note.trim().length < 30)
      return setError('제주와의 관계를 30자 이상 적어 주세요.');
    if (fileError !== undefined) return setError(fileError);
    if (!consent)
      return setError('증빙 사용 목적과 개인정보 안내에 동의해 주세요.');
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
      setError(applicationError(caught));
      setPending(false);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => void submit(event)}
      noValidate
      data-verification-form
    >
      <section className={styles.formSection}>
        <header>
          <h2>현재 위치</h2>
          <p>
            {destination.nameKo} 중심 반경 {destination.radiusKm}km 안에
            있는지만 확인해요. 좌표는 화면에 표시하지 않아요.
          </p>
        </header>
        <button
          className={styles.locate}
          type="button"
          onClick={captureLocation}
          disabled={locating}
        >
          {locating
            ? '위치 확인 중…'
            : location === undefined
              ? '현재 위치 확인'
              : '위치 다시 확인'}
        </button>
        {locationMessage !== undefined && (
          <div
            className={styles.locationResult}
            data-tone={location === undefined ? 'error' : 'success'}
            role="status"
          >
            <AppIcon name={location === undefined ? 'alert' : 'check'} />
            <span>{locationMessage}</span>
          </div>
        )}
      </section>
      <section className={styles.formSection}>
        <header>
          <h2>연고 확인</h2>
          <p>관리자가 확인할 수 있도록 구체적으로 알려 주세요.</p>
        </header>
        <label className={styles.field}>
          연고 유형
          <select
            className={styles.control}
            value={proofType}
            onChange={(e) => setProofType(e.target.value as LocalProofType)}
          >
            <option value="RESIDENCE">거주</option>
            <option value="WORK">근무</option>
            <option value="STUDY">학업</option>
            <option value="OTHER">기타</option>
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            관계 설명 <span>{note.length}/300</span>
          </span>
          <textarea
            className={styles.control}
            maxLength={300}
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="제주에서 생활한 기간과 잘 아는 지역 등을 30자 이상 적어 주세요."
          />
        </label>
        <label className={styles.upload}>
          연고 증빙 선택
          <input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={(e) => setProof(e.target.files?.[0])}
          />
          <span>{proof?.name ?? 'JPEG, PNG, PDF 파일, 최대 5MB'}</span>
        </label>
      </section>
      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          <strong>위치·증빙 확인 및 개인정보 이용에 동의합니다.</strong> 정확한
          위치와 파일은 인증 심사에만 사용되며 일반 사용자에게 공개되지
          않습니다.
        </span>
      </label>
      {error !== undefined && (
        <div className="formAlert" role="alert">
          <span aria-hidden="true">
            <AppIcon name="alert" />
          </span>
          <p>{error}</p>
        </div>
      )}
      <button className={styles.submit} disabled={pending}>
        {pending ? (
          <>
            <span className="buttonSpinner" /> 신청 보내는 중
          </>
        ) : (
          '현지인 인증 신청하기'
        )}
      </button>
    </form>
  );
}
