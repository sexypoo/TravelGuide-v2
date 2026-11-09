'use client';

import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { Button, ButtonLink, Notice } from '@/components/ui';
import { useMessages } from '@/i18n/client';
import { registerPreorder } from '@/lib/api/preorders';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import {
  validatePreorder,
  type PreorderFieldErrors,
} from '@/lib/preorders/validation';
import styles from './preorder-form.module.css';

function hasErrors(errors: PreorderFieldErrors): boolean {
  return Object.values(errors).some((message) => message !== undefined);
}

export function PreorderForm(): React.JSX.Element {
  const { preorder } = useMessages().legal;
  const t = preorder.form;
  const [errors, setErrors] = useState<PreorderFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setFormError(null);
    const form = new FormData(event.currentTarget);
    const draft = {
      name: String(form.get('name') ?? '').trim(),
      email: String(form.get('email') ?? '')
        .trim()
        .toLowerCase(),
      privacyConsent: form.get('privacyConsent') === 'on',
    };
    const nextErrors = validatePreorder(draft, preorder.validation);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    try {
      await registerPreorder({
        name: draft.name,
        email: draft.email,
        privacyConsent: true,
      });
      setIsComplete(true);
    } catch (error: unknown) {
      setFormError(actionableErrorMessage(error, t.saveFailed));
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon} aria-hidden="true">
          <AppIcon name="check" />
        </span>
        <p className={styles.kicker}>{t.successKicker}</p>
        <h2>{t.successTitle}</h2>
        <p>{t.successBody}</p>
        <ButtonLink href="/" variant="secondary" block>
          {t.successLink}
        </ButtonLink>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      method="post"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <div className={styles.heading}>
        <p className={styles.kicker}>{t.kicker}</p>
        <h2>{t.title}</h2>
        <p>{t.body}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="preorder-name">{t.name}</label>
        <input
          id="preorder-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder={t.namePlaceholder}
          aria-invalid={errors.name !== undefined}
          aria-describedby={
            errors.name === undefined ? undefined : 'name-error'
          }
        />
        {errors.name !== undefined && (
          <p className={styles.fieldError} id="name-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="preorder-email">{t.email}</label>
        <input
          id="preorder-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="name@example.com"
          aria-invalid={errors.email !== undefined}
          aria-describedby={
            errors.email === undefined ? undefined : 'email-error'
          }
        />
        {errors.email !== undefined && (
          <p className={styles.fieldError} id="email-error">
            {errors.email}
          </p>
        )}
      </div>

      <div className={styles.consent}>
        <label>
          <input
            name="privacyConsent"
            type="checkbox"
            aria-describedby={
              errors.privacyConsent === undefined ? undefined : 'consent-error'
            }
          />
          <span>
            <strong>{t.consentRequired}</strong> {t.consentText}
          </span>
        </label>
        {errors.privacyConsent !== undefined && (
          <p className={styles.fieldError} id="consent-error">
            {errors.privacyConsent}
          </p>
        )}
      </div>

      {formError !== null && (
        <Notice tone="danger" icon="alert" role="alert">
          {formError}
        </Notice>
      )}

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className={styles.spinner} aria-hidden="true" /> {t.saving}
          </>
        ) : (
          <>
            {t.submit} <AppIcon name="arrow-right" />
          </>
        )}
      </Button>
      <p className={styles.status} aria-live="polite">
        {isSubmitting ? t.savingStatus : ''}
      </p>
    </form>
  );
}
