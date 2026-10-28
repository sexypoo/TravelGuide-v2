'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import type { LocalProofType } from '@/lib/api/verifications';
import { submitLocalVerification } from '@/lib/api/verifications';
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

const locateTitles: Readonly<Record<LocateState, string>> = {
  idle: '아직 확인하지 않았어요',
  locating: '위치를 확인하고 있어요',
  done: '위치 확인 완료',
  error: '위치를 확인하지 못했어요',
};

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
          latitude: toCoordinate(position.coords.latitude),
          longitude: toCoordinate(position.coords.longitude),
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
            title: '현재 위치 확인',
            text: `${destination.nameKo} 안에서 버튼 한 번으로 확인해요`,
          },
          {
            icon: 'notebook',
            title: '연고 증빙',
            text: '거주, 근무, 학업을 확인할 수 있는 서류 한 장',
          },
        ]}
      />
      <FormCard
        title="현재 위치"
        description={`${destination.nameKo} 중심 반경 ${destination.radiusKm}km 안에 있는지만 확인해요. 좌표는 화면에 표시하지 않아요.`}
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
            <strong>{locateTitles[locateState]}</strong>
            <small>{locationMessage ?? '정확도 200m 이내에서 확인돼요'}</small>
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
            ? '위치 확인 중…'
            : location === undefined
              ? '현재 위치 확인'
              : '위치 다시 확인'}
        </Button>
      </FormCard>
      <FormCard
        title="연고 확인"
        description="관리자가 확인할 수 있도록 구체적으로 알려 주세요."
      >
        <label className={styles.field}>
          <span className={styles.label}>연고 유형</span>
          <span className={styles.selectFrame}>
            <select
              value={proofType}
              onChange={(e) => setProofType(e.target.value as LocalProofType)}
            >
              <option value="RESIDENCE">거주</option>
              <option value="WORK">근무</option>
              <option value="STUDY">학업</option>
              <option value="OTHER">기타</option>
            </select>
            <AppIcon name="chevron-right" className={styles.selectChevron} />
          </span>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>
            관계 설명 <small>{note.length}/300</small>
          </span>
          <textarea
            maxLength={300}
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="제주에서 생활한 기간과 잘 아는 지역 등을 30자 이상 적어 주세요."
          />
        </label>
        <ProofPicker label="연고 증빙 선택" file={proof} onChange={setProof} />
      </FormCard>
      <ConsentCard
        checked={consent}
        onChange={setConsent}
        title="위치·증빙 확인 및 개인정보 이용에 동의합니다."
      >
        정확한 위치와 파일은 인증 심사에만 사용되며 일반 사용자에게 공개되지
        않습니다.
      </ConsentCard>
      <FormFooter
        error={error}
        pending={pending}
        label="현지인 인증 신청하기"
      />
    </form>
  );
}
