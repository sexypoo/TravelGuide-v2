'use client';

import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { Button, ButtonLink, Notice } from '@/components/ui';
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
    const nextErrors = validatePreorder(draft);
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
      setFormError(
        actionableErrorMessage(
          error,
          '신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
        ),
      );
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon} aria-hidden="true">
          <AppIcon name="check" />
        </span>
        <p className={styles.kicker}>신청 완료</p>
        <h2>첫 출발 명단에 등록했어요.</h2>
        <p>첫 파일럿 소식이 준비되면 입력한 이메일로 알려드릴게요.</p>
        <ButtonLink href="/" variant="secondary" block>
          여쭈어 더 알아보기
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
        <p className={styles.kicker}>사전예약</p>
        <h2>첫 오픈 소식 받기</h2>
        <p>필요한 안내만 이메일로 보내드려요.</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="preorder-name">이름</label>
        <input
          id="preorder-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="이름을 입력해 주세요"
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
        <label htmlFor="preorder-email">이메일</label>
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
            <strong>필수</strong> 사전예약 접수와 출시 안내를 위한 이름·이메일
            수집에 동의합니다.
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
            <span className={styles.spinner} aria-hidden="true" /> 저장 중
          </>
        ) : (
          <>
            사전예약 신청하기 <AppIcon name="arrow-right" />
          </>
        )}
      </Button>
      <p className={styles.status} aria-live="polite">
        {isSubmitting ? '사전예약 신청을 저장하고 있습니다.' : ''}
      </p>
    </form>
  );
}
