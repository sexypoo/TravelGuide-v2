'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Notice } from '@/components/ui';
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
import { useMessages } from '@/i18n/client';
import type { Messages } from '@/i18n/messages';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';
import {
  validateLogin,
  validateRegistration,
  type AuthFieldErrors,
} from '@/lib/auth/validation';
import styles from './auth.module.css';

interface AuthFormProps {
  mode: 'login' | 'register';
  nextPath?: string;
  socialError?: boolean;
}

function hasErrors(errors: AuthFieldErrors): boolean {
  return Object.values(errors).some((message) => message !== undefined);
}

function errorMessage(error: unknown, t: Messages): string {
  if (!(error instanceof ApiProblem)) return t.errors.network;
  return (
    t.auth.errors[error.code] ?? actionableErrorMessage(error, t.errors.generic)
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
    <div className={styles.field}>
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
        <p className={styles.fieldError} id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

function providerContent(
  t: Messages['auth']['form'],
  provider: SocialProvider,
): {
  mark: string;
  label: string;
} {
  if (provider === 'google') return { mark: 'G', label: t.google };
  if (provider === 'kakao') return { mark: 'K', label: t.kakao };
  return { mark: '●', label: t.apple };
}

export function AuthForm({
  mode,
  nextPath = '/app',
  socialError = false,
}: AuthFormProps): React.JSX.Element {
  const router = useRouter();
  const t = useMessages();
  const f = t.auth.form;
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
        termsAgreed: f.termsMissing,
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
      ? validateRegistration(
          {
            email,
            password,
            nickname,
            termsAgreed: submittedTermsAgreed,
          },
          t.auth.validation,
        )
      : validateLogin({ email, password }, t.auth.validation);

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
      setFormError(errorMessage(error, t));
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={styles.form}
      method="post"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <Field
        id="email"
        label={f.email}
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        error={errors.email}
      />
      {isRegister && (
        <Field
          id="nickname"
          label={f.nickname}
          type="text"
          autoComplete="nickname"
          placeholder={f.nicknamePlaceholder}
          error={errors.nickname}
        />
      )}
      <Field
        id="password"
        label={f.password}
        type="password"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        placeholder={
          isRegister
            ? f.passwordPlaceholderRegister
            : f.passwordPlaceholderLogin
        }
        error={errors.password}
      />

      {isRegister && (
        <div className={styles.terms}>
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
              <strong>{f.termsRequired}</strong> {f.termsText}
            </span>
          </label>
          {errors.termsAgreed !== undefined && (
            <p className={styles.fieldError} id="terms-help">
              {errors.termsAgreed}
            </p>
          )}
        </div>
      )}

      {(formError !== null || socialError) && (
        <Notice tone="danger" icon="alert" role="alert">
          {formError ?? f.socialFailed}
        </Notice>
      )}

      <Button
        className={styles.submit}
        type="submit"
        size="lg"
        block
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />{' '}
            {t.common.processing}
          </>
        ) : isRegister ? (
          t.common.register
        ) : (
          t.common.login
        )}
      </Button>

      {capabilities !== null && capabilities.socialProviders.length > 0 && (
        <div className={styles.social}>
          <div className={styles.divider} aria-hidden="true">
            <span>{f.or}</span>
          </div>
          <div className={styles.socialButtons} aria-label={f.socialLabel}>
            {capabilities.socialProviders.map((provider) => {
              const content = providerContent(f, provider);
              return (
                <button
                  className={`${styles.socialButton} ${styles[`social--${provider}`] ?? ''}`}
                  type="button"
                  key={provider}
                  onClick={() => startSocialLogin(provider)}
                >
                  <span className={styles.socialMark} aria-hidden="true">
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
        <p className={styles.help}>
          {f.forgotPrompt}{' '}
          <Link href="/auth/forgot-password">{f.forgotLink}</Link>
        </p>
      )}
      <p className={styles.status} aria-live="polite">
        {isSubmitting
          ? isRegister
            ? f.submittingRegister
            : f.submittingLogin
          : ''}
      </p>
    </form>
  );
}
