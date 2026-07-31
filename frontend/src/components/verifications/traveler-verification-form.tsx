'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { submitTravelerVerification } from '@/lib/api/verifications';
import {
  applicationError,
  localDateToIso,
  proofError,
} from './verification-form-utils';

export function TravelerVerificationForm({
  destinationId,
}: {
  destinationId: string;
}): React.JSX.Element {
  const router = useRouter();
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [note, setNote] = useState('');
  const [proof, setProof] = useState<File>();
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const fileError = proofError(proof);
    if (startsAt === '' || endsAt === '')
      return setError('여행 시작일과 종료일을 선택해 주세요.');
    if (startsAt > endsAt)
      return setError('여행 시작일은 종료일보다 늦을 수 없어요.');
    if (fileError !== undefined) return setError(fileError);
    if (!consent)
      return setError('증빙 사용 목적과 개인정보 안내에 동의해 주세요.');

    const data = new FormData();
    data.set('destinationId', destinationId);
    data.set('startsAt', localDateToIso(startsAt, false));
    data.set('endsAt', localDateToIso(endsAt, true));
    if (note.trim() !== '') data.set('note', note.trim());
    if (proof !== undefined) data.set('proofFile', proof);
    setPending(true);
    setError(undefined);
    try {
      await submitTravelerVerification(data);
      router.push('/app/verifications?submitted=traveler');
      router.refresh();
    } catch (caught: unknown) {
      setError(applicationError(caught));
      setPending(false);
    }
  }

  return (
    <form
      className="verificationForm"
      onSubmit={(event) => void submit(event)}
      noValidate
    >
      <section className="formSection">
        <div className="formSection__heading">
          <span>1</span>
          <div>
            <h2>여행 일정</h2>
            <p>방을 이용할 날짜를 확인해요.</p>
          </div>
        </div>
        <div className="dateFieldGrid">
          <label>
            시작일
            <input
              type="date"
              min={today}
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </label>
          <label>
            종료일
            <input
              type="date"
              min={startsAt || today}
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </label>
        </div>
      </section>
      <section className="formSection">
        <div className="formSection__heading">
          <span>2</span>
          <div>
            <h2>여행 증빙</h2>
            <p>항공권이나 숙소 예약 내역을 준비해 주세요.</p>
          </div>
        </div>
        <label className="proofDrop">
          증빙 파일 선택
          <input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={(e) => setProof(e.target.files?.[0])}
          />
          <span>{proof?.name ?? 'JPEG, PNG, PDF · 최대 5MB'}</span>
        </label>
        <label className="stackField">
          관리자에게 남길 메모 <span>{note.length}/300</span>
          <textarea
            maxLength={300}
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="확인에 도움이 되는 내용을 적어 주세요. (선택)"
          />
        </label>
      </section>
      <Consent checked={consent} onChange={setConsent} />
      {error !== undefined && (
        <div className="formAlert" role="alert">
          <span>!</span>
          <p>{error}</p>
        </div>
      )}
      <button className="verificationSubmit" disabled={pending}>
        {pending ? (
          <>
            <span className="buttonSpinner" /> 신청 보내는 중
          </>
        ) : (
          '여행자 인증 신청하기'
        )}
      </button>
    </form>
  );
}

function Consent({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}): React.JSX.Element {
  return (
    <label className="verificationConsent">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <strong>증빙 확인 및 개인정보 이용에 동의합니다.</strong> 제출한 파일과
        일정은 인증 심사에만 사용되며 일반 사용자에게 공개되지 않습니다.
      </span>
    </label>
  );
}
