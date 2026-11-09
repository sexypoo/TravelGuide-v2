'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMessages } from '@/i18n/client';
import type { Messages } from '@/i18n/messages';
import { deleteOwnAccount } from '@/lib/api/profile';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';
import styles from './profile.module.css';

interface AccountDeletionPanelProps {
  hasPassword: boolean;
}

// The API only accepts its own phrase. The user types the phrase in their
// language, and the request always carries this one (#80).
const API_CONFIRMATION = '계정 삭제';

function deletionErrorMessage(
  error: unknown,
  t: Messages['profile']['deletion'],
): string {
  if (
    error instanceof ApiProblem &&
    error.code === 'ACCOUNT_DELETION_REAUTH_FAILED'
  ) {
    return t.reauthFailed;
  }
  return actionableErrorMessage(error, t.failed);
}

export function AccountDeletionPanel({
  hasPassword,
}: AccountDeletionPanelProps): React.JSX.Element {
  const router = useRouter();
  const messages = useMessages();
  const t = messages.profile.deletion;
  const [expanded, setExpanded] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready =
    confirmation.trim() === t.confirmationPhrase &&
    (!hasPassword || password.length > 0) &&
    !submitting;

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteOwnAccount({
        confirmation: API_CONFIRMATION,
        ...(hasPassword ? { password } : {}),
      });
      router.replace('/account-deletion?deleted=true');
      router.refresh();
    } catch (caught: unknown) {
      setError(deletionErrorMessage(caught, t));
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.section} aria-labelledby="account-title">
      <header className={styles.sectionHeader}>
        <div>
          <h2 id="account-title">{t.title}</h2>
          <p>{t.description}</p>
        </div>
      </header>
      <nav className={styles.accountLinks} aria-label={t.policiesLabel}>
        <Link href="/privacy">{t.privacy}</Link>
        <Link href="/account-deletion">{t.guide}</Link>
      </nav>

      {!expanded ? (
        <button
          className={`${styles.textButton} ${styles.openDeletion}`}
          type="button"
          onClick={() => setExpanded(true)}
        >
          {t.open}
        </button>
      ) : (
        <form method="post" className={styles.deletion} onSubmit={submit}>
          <div>
            <strong>{t.warningTitle}</strong>
            <p>{t.warningBody}</p>
            <ol aria-label={t.scopeLabel}>
              {t.scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>

          {hasPassword ? (
            <label>
              <span>{t.currentPassword}</span>
              <input
                className={styles.control}
                autoComplete="current-password"
                disabled={submitting}
                maxLength={72}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>
          ) : (
            <p>{t.socialAccount}</p>
          )}

          <label>
            <span>
              {t.confirmBefore}
              <b>{t.confirmationPhrase}</b>
              {t.confirmAfter}
            </span>
            <input
              className={styles.control}
              autoComplete="off"
              disabled={submitting}
              onChange={(event) => setConfirmation(event.target.value)}
              value={confirmation}
            />
          </label>

          {error === null ? null : (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.deletionActions}>
            <button
              className={styles.textButton}
              type="button"
              disabled={submitting}
              onClick={() => {
                setExpanded(false);
                setConfirmation('');
                setPassword('');
                setError(null);
              }}
            >
              {messages.common.cancel}
            </button>
            <button
              className={styles.dangerButton}
              type="submit"
              disabled={!ready}
            >
              {submitting ? t.deleting : t.submit}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
