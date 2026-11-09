'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { ButtonLink, Button, Notice } from '@/components/ui';
import { useMessages } from '@/i18n/client';
import type { Messages } from '@/i18n/messages';
import { requestPasswordReset, resetPassword } from '@/lib/api/auth-client';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';
import styles from './auth.module.css';

interface PasswordRecoveryFormProps {
  mode: 'forgot' | 'reset';
  token?: string;
}

function messageFor(error: unknown, t: Messages): string {
  if (!(error instanceof ApiProblem)) return t.errors.network;
  if (error.code === 'PASSWORD_RESET_TOKEN_INVALID') {
    return t.auth.recovery.expired;
  }
  if (error.code === 'PASSWORD_EMAIL_UNAVAILABLE') {
    return t.auth.recovery.mailUnavailable;
  }
  return actionableErrorMessage(error, t.auth.recovery.failed);
}

export function PasswordRecoveryForm({
  mode,
  token,
}: PasswordRecoveryFormProps): React.JSX.Element {
  const t = useMessages();
  const r = t.auth.recovery;
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setFieldError(null);
    setFormError(null);
    const form = new FormData(event.currentTarget);

    if (mode === 'forgot') {
      const email = String(form.get('email') ?? '')
        .trim()
        .toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) || email.length > 320) {
        setFieldError(r.invalidEmail);
        return;
      }
      setIsSubmitting(true);
      try {
        await requestPasswordReset(email);
        setCompleted(true);
      } catch (error: unknown) {
        setFormError(messageFor(error, t));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const password = String(form.get('password') ?? '');
    const confirmation = String(form.get('passwordConfirmation') ?? '');
    if (
      password.length < 10 ||
      password.length > 72 ||
      !/[A-Za-z]/u.test(password) ||
      !/\d/u.test(password)
    ) {
      setFieldError(t.auth.validation.passwordRule);
      return;
    }
    if (password !== confirmation) {
      setFieldError(r.mismatch);
      return;
    }
    if (token === undefined || !/^[A-Za-z0-9_-]{43}$/u.test(token)) {
      setFormError(r.invalidLink);
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setCompleted(true);
    } catch (error: unknown) {
      setFormError(messageFor(error, t));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (completed) {
    return (
      <section className={styles.complete} aria-live="polite">
        <span className={styles.completeIcon} aria-hidden="true">
          <AppIcon name="check" />
        </span>
        <h2>{mode === 'forgot' ? r.sentTitle : r.doneTitle}</h2>
        <p>{mode === 'forgot' ? r.sentBody : r.doneBody}</p>
        <ButtonLink href="/auth/login" size="lg" block>
          {r.backToLogin}
        </ButtonLink>
      </section>
    );
  }

  return (
    <form
      className={styles.form}
      method="post"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      {mode === 'forgot' ? (
        <div className={styles.field}>
          <label htmlFor="email">{r.emailLabel}</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            aria-invalid={fieldError !== null}
            aria-describedby={
              fieldError === null ? undefined : 'recovery-field-error'
            }
          />
        </div>
      ) : (
        <>
          <div className={styles.field}>
            <label htmlFor="password">{r.newPassword}</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={t.auth.form.passwordPlaceholderRegister}
              aria-invalid={fieldError !== null}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="passwordConfirmation">{r.confirmPassword}</label>
            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              placeholder={r.confirmPlaceholder}
              aria-invalid={fieldError !== null}
              aria-describedby={
                fieldError === null ? undefined : 'recovery-field-error'
              }
            />
          </div>
        </>
      )}

      {fieldError !== null && (
        <p className={styles.fieldError} id="recovery-field-error">
          {fieldError}
        </p>
      )}
      {formError !== null && (
        <Notice tone="danger" icon="alert" role="alert">
          {formError}
        </Notice>
      )}
      <Button
        className={styles.submit}
        type="submit"
        size="lg"
        block
        disabled={isSubmitting}
      >
        {isSubmitting
          ? t.common.processing
          : mode === 'forgot'
            ? r.sendMail
            : r.savePassword}
      </Button>
      <p className={styles.help}>
        <Link href="/auth/login">{r.backToLogin}</Link>
      </p>
    </form>
  );
}
