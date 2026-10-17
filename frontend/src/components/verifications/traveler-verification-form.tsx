'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { submitTravelerVerification } from '@/lib/api/verifications';
import {
  applicationError,
  localDateToIso,
  proofError,
} from './verification-form-utils';
import {
  ConsentCard,
  FormCard,
  FormFooter,
  PrepareCard,
  ProofPicker,
} from './verification-form-parts';
import styles from './verification.module.css';

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
      className={styles.form}
      method="post"
      onSubmit={(event) => void submit(event)}
      noValidate
      data-verification-form
    >
      <PrepareCard
        items={[
          {
            icon: 'clock',
            title: '여행 일정',
            text: '도움방을 이용할 시작일과 종료일',
          },
          {
            icon: 'notebook',
            title: '예약 증빙',
            text: '항공권이나 숙소 예약 내역 한 장',
          },
        ]}
      />
      <FormCard
        title="여행 일정"
        description="도움방을 이용할 날짜를 골라 주세요."
      >
        <div className={styles.dates}>
          <label className={styles.field}>
            <span className={styles.label}>시작일</span>
            <span className={styles.dateFrame} data-date-frame>
              <input
                type="date"
                min={today}
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </span>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>종료일</span>
            <span className={styles.dateFrame} data-date-frame>
              <input
                type="date"
                min={startsAt || today}
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </span>
          </label>
        </div>
      </FormCard>
      <FormCard
        title="여행 증빙"
        description="항공권이나 숙소 예약 내역을 올려 주세요."
      >
        <ProofPicker label="증빙 파일 선택" file={proof} onChange={setProof} />
        <label className={styles.field}>
          <span className={styles.label}>
            관리자에게 남길 메모 (선택) <small>{note.length}/300</small>
          </span>
          <textarea
            maxLength={300}
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="확인에 도움이 되는 내용을 적어 주세요."
          />
        </label>
      </FormCard>
      <ConsentCard
        checked={consent}
        onChange={setConsent}
        title="증빙 확인 및 개인정보 이용에 동의합니다."
      >
        제출한 파일과 일정은 인증 심사에만 사용되며 일반 사용자에게 공개되지
        않습니다.
      </ConsentCard>
      <FormFooter
        error={error}
        pending={pending}
        label="여행자 인증 신청하기"
      />
    </form>
  );
}
