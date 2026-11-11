'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMessages } from '@/i18n/client';
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
  const messages = useMessages().verifications;
  const t = messages.traveler;
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
    const fileError = proofError(proof, messages.form);
    if (startsAt === '' || endsAt === '') return setError(t.datesMissing);
    if (startsAt > endsAt) return setError(t.datesOrder);
    if (fileError !== undefined) return setError(fileError);
    if (!consent) return setError(messages.form.consentMissing);

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
      setError(applicationError(caught, messages));
      setPending(false);
    }
  }

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
            icon: 'clock',
            title: t.prepareDates,
            text: t.prepareDatesText,
          },
          {
            icon: 'notebook',
            title: t.prepareProof,
            text: t.prepareProofText,
          },
        ]}
      />
      <FormCard title={t.datesTitle} description={t.datesDescription}>
        <div className={styles.dates}>
          <label className={styles.field}>
            <span className={styles.label}>{messages.form.startDate}</span>
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
            <span className={styles.label}>{messages.form.endDate}</span>
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
      <FormCard title={t.proofTitle} description={t.proofDescription}>
        <ProofPicker label={t.proofLabel} file={proof} onChange={setProof} />
        <label className={styles.field}>
          <span className={styles.label}>
            {t.note} <small>{note.length}/300</small>
          </span>
          <textarea
            maxLength={300}
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.notePlaceholder}
          />
        </label>
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
