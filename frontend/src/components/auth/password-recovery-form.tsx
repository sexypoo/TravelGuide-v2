'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { requestPasswordReset, resetPassword } from '@/lib/api/auth-client';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';

interface PasswordRecoveryFormProps {
  mode: 'forgot' | 'reset';
  token?: string;
}

function messageFor(error: unknown): string {
  if (!(error instanceof ApiProblem)) {
    return '연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (error.code === 'PASSWORD_RESET_TOKEN_INVALID') {
    return '재설정 링크가 만료되었거나 이미 사용되었습니다. 새 링크를 받아 주세요.';
  }
  if (error.code === 'PASSWORD_EMAIL_UNAVAILABLE') {
    return '현재 메일을 보낼 수 없습니다. 잠시 후 다시 시도해 주세요.';
  }
  return actionableErrorMessage(error, '요청을 처리하지 못했습니다.');
}

export function PasswordRecoveryForm({
  mode,
  token,
}: PasswordRecoveryFormProps): React.JSX.Element {
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
        setFieldError('올바른 이메일 주소를 입력해 주세요.');
        return;
      }
      setIsSubmitting(true);
      try {
        await requestPasswordReset(email);
        setCompleted(true);
      } catch (error: unknown) {
        setFormError(messageFor(error));
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
      setFieldError('영문과 숫자를 포함해 10~72자로 입력해 주세요.');
      return;
    }
    if (password !== confirmation) {
      setFieldError('새 비밀번호가 서로 일치하지 않습니다.');
      return;
    }
    if (token === undefined || !/^[A-Za-z0-9_-]{43}$/u.test(token)) {
      setFormError('재설정 링크가 올바르지 않습니다. 새 링크를 받아 주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setCompleted(true);
    } catch (error: unknown) {
      setFormError(messageFor(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (completed) {
    return (
      <section className="recoveryComplete" aria-live="polite">
        <span aria-hidden="true">
          <AppIcon name="check" />
        </span>
        <h2>
          {mode === 'forgot' ? '메일을 확인해 주세요' : '비밀번호가 변경됐어요'}
        </h2>
        <p>
          {mode === 'forgot'
            ? '가입 여부와 관계없이 같은 안내를 보여드려요. 계정이 있다면 30분 동안 사용할 수 있는 링크를 보냈습니다.'
            : '새 비밀번호로 다시 로그인해 주세요. 기존 로그인 세션은 안전하게 종료됩니다.'}
        </p>
        <Link className="primaryButton" href="/auth/login">
          로그인으로 돌아가기
        </Link>
      </section>
    );
  }

  return (
    <form
      className="authForm"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      {mode === 'forgot' ? (
        <div className="formField">
          <label htmlFor="email">가입한 이메일</label>
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
          <div className="formField">
            <label htmlFor="password">새 비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="영문과 숫자를 포함해 10자 이상"
              aria-invalid={fieldError !== null}
            />
          </div>
          <div className="formField">
            <label htmlFor="passwordConfirmation">새 비밀번호 확인</label>
            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              placeholder="한 번 더 입력해 주세요"
              aria-invalid={fieldError !== null}
              aria-describedby={
                fieldError === null ? undefined : 'recovery-field-error'
              }
            />
          </div>
        </>
      )}

      {fieldError !== null && (
        <p className="fieldError" id="recovery-field-error">
          {fieldError}
        </p>
      )}
      {formError !== null && (
        <div className="formAlert" role="alert">
          <span aria-hidden="true">
            <AppIcon name="alert" />
          </span>
          <p>{formError}</p>
        </div>
      )}
      <button className="primaryButton" type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? '처리 중'
          : mode === 'forgot'
            ? '재설정 메일 받기'
            : '새 비밀번호 저장'}
      </button>
      <p className="authHelp">
        <Link href="/auth/login">로그인으로 돌아가기</Link>
      </p>
    </form>
  );
}
