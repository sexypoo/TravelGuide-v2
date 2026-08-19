'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppIcon } from '@/components/common';
import {
  getAuthCapabilities,
  login,
  register,
  socialLoginUrl,
  type AuthCapabilities,
  type LoginInput,
  type RegisterInput,
  type SocialProvider,
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
  socialError?: boolean;
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

function providerContent(provider: SocialProvider): {
  mark: string;
  label: string;
} {
  if (provider === 'google') return { mark: 'G', label: 'Google로 계속하기' };
  if (provider === 'kakao') return { mark: 'K', label: '카카오로 계속하기' };
  return { mark: '●', label: 'Apple로 계속하기' };
}

export function AuthForm({
  mode,
  nextPath = '/app',
  socialError = false,
}: AuthFormProps): React.JSX.Element {
  const router = useRouter();
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [capabilities, setCapabilities] = useState<AuthCapabilities | null>(
    null,
  );
  const isRegister = mode === 'register';

  useEffect(() => {
    let active = true;
    void getAuthCapabilities()
      .then((value) => {
        if (active) setCapabilities(value);
      })
      .catch(() => {
        if (active) {
          setCapabilities({ passwordReset: false, socialProviders: [] });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function startSocialLogin(provider: SocialProvider): void {
    if (isRegister && !termsAgreed) {
      setErrors((current) => ({
        ...current,
        termsAgreed: '필수 약관에 동의해 주세요.',
      }));
      return;
    }
    window.location.assign(
      socialLoginUrl({ provider, mode, nextPath, termsAgreed }),
    );
  }

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
    const submittedTermsAgreed = form.get('termsAgreed') === 'on';
    const validationErrors = isRegister
      ? validateRegistration({
          email,
          password,
          nickname,
          termsAgreed: submittedTermsAgreed,
        })
      : validateLogin({ email, password });

    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

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
              checked={termsAgreed}
              onChange={(event) => {
                setTermsAgreed(event.currentTarget.checked);
                if (event.currentTarget.checked) {
                  setErrors((current) => ({
                    ...current,
                    termsAgreed: undefined,
                  }));
                }
              }}
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

      {(formError !== null || socialError) && (
        <div className="formAlert" role="alert">
          <span aria-hidden="true">
            <AppIcon name="alert" />
          </span>
          <p>
            {formError ??
              '소셜 로그인을 완료하지 못했습니다. 다시 시도하거나 다른 방법을 이용해 주세요.'}
          </p>
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

      {capabilities !== null && capabilities.socialProviders.length > 0 && (
        <div className="socialAuth">
          <div className="authDivider" aria-hidden="true">
            <span>또는 간편하게</span>
          </div>
          <div className="socialAuth__buttons" aria-label="소셜 로그인">
            {capabilities.socialProviders.map((provider) => {
              const content = providerContent(provider);
              return (
                <button
                  className={`socialButton socialButton--${provider}`}
                  type="button"
                  key={provider}
                  onClick={() => startSocialLogin(provider)}
                >
                  <span className="socialButton__mark" aria-hidden="true">
                    {content.mark}
                  </span>
                  {content.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isRegister && capabilities?.passwordReset === true && (
        <p className="authHelp">
          비밀번호가 기억나지 않나요?{' '}
          <Link href="/auth/forgot-password">비밀번호 재설정</Link>
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
