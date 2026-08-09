'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import {
  login,
  register,
  type LoginInput,
  type RegisterInput,
} from '@/lib/api/auth-client';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';
import {
  validateLogin,
  validateRegistration,
  type AuthFieldErrors,
} from '@/lib/auth/validation';

interface AuthFormProps {
  mode: 'login' | 'register';
  nextPath?: string;
}

function hasErrors(errors: AuthFieldErrors): boolean {
  return Object.values(errors).some((message) => message !== undefined);
}

function errorMessage(error: unknown): string {
  if (!(error instanceof ApiProblem)) {
    return '연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.';
  }

  const messages: Readonly<Record<string, string>> = {
    EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다. 로그인해 주세요.',
    NICKNAME_ALREADY_EXISTS:
      '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.',
    INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
    VALIDATION_FAILED: '입력한 내용을 다시 확인해 주세요.',
  };

  return (
    messages[error.code] ??
    actionableErrorMessage(
      error,
      '요청을 처리하지 못했습니다. 다시 시도해 주세요.',
    )
  );
}

interface FieldProps {
  id: string;
  label: string;
  type: 'email' | 'password' | 'text';
  autoComplete: string;
  placeholder: string;
  error?: string;
}

function Field({
  id,
  label,
  type,
  autoComplete,
  placeholder,
  error,
}: FieldProps): React.JSX.Element {
  const errorId = `${id}-error`;
  return (
    <div className="formField">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error !== undefined}
        aria-describedby={error === undefined ? undefined : errorId}
      />
      {error !== undefined && (
        <p className="fieldError" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthForm({
  mode,
  nextPath = '/app',
}: AuthFormProps): React.JSX.Element {
  const router = useRouter();
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === 'register';

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '')
      .trim()
      .toLowerCase();
    const password = String(form.get('password') ?? '');
    const nickname = String(form.get('nickname') ?? '').trim();
    const termsAgreed = form.get('termsAgreed') === 'on';
    const validationErrors = isRegister
      ? validateRegistration({ email, password, nickname, termsAgreed })
      : validateLogin({ email, password });

    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        const input: RegisterInput = {
          email,
          password,
          nickname,
          termsAgreed: true,
        };
        await register(input);
      } else {
        const input: LoginInput = { email, password };
        await login(input);
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error: unknown) {
      setFormError(errorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="authForm"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <Field
        id="email"
        label="이메일"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        error={errors.email}
      />
      {isRegister && (
        <Field
          id="nickname"
          label="닉네임"
          type="text"
          autoComplete="nickname"
          placeholder="2~20자로 입력해 주세요"
          error={errors.nickname}
        />
      )}
      <Field
        id="password"
        label="비밀번호"
        type="password"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        placeholder={
          isRegister ? '영문과 숫자를 포함해 10자 이상' : '비밀번호 입력'
        }
        error={errors.password}
      />

      {isRegister && (
        <div className="termsField">
          <label>
            <input
              name="termsAgreed"
              type="checkbox"
              aria-describedby={
                errors.termsAgreed === undefined ? undefined : 'terms-help'
              }
            />
            <span>
              <strong>필수</strong> 서비스 이용약관과 개인정보 처리방침에
              동의합니다.
            </span>
          </label>
          {errors.termsAgreed !== undefined && (
            <p className="fieldError" id="terms-help">
              {errors.termsAgreed}
            </p>
          )}
        </div>
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
        {isSubmitting ? (
          <>
            <span className="buttonSpinner" aria-hidden="true" /> 처리 중
          </>
        ) : isRegister ? (
          '계정 만들기'
        ) : (
          '로그인'
        )}
      </button>

      {!isRegister && (
        <p className="authHelp">
          로그인에 문제가 있나요? 비밀번호 재설정은 아직 제공하지 않습니다.{' '}
          <Link href="/">서비스 안내 보기</Link>
        </p>
      )}
      <p className="submitStatus" aria-live="polite">
        {isSubmitting
          ? `${isRegister ? '가입' : '로그인'} 요청을 처리하고 있습니다.`
          : ''}
      </p>
    </form>
  );
}
