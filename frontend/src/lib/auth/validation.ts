export interface AuthFieldErrors {
  email?: string;
  password?: string;
  nickname?: string;
  termsAgreed?: string;
}

import { ko } from '@/i18n/messages/ko';

type ValidationMessages = typeof ko.auth.validation;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function validateLogin(
  input: {
    email: string;
    password: string;
  },
  messages: ValidationMessages = ko.auth.validation,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const email = input.email.trim();

  if (!emailPattern.test(email) || email.length > 320) {
    errors.email = messages.email;
  }
  if (input.password.length === 0) {
    errors.password = messages.passwordMissing;
  }

  return errors;
}

export function validateRegistration(
  input: {
    email: string;
    password: string;
    nickname: string;
    termsAgreed: boolean;
  },
  messages: ValidationMessages = ko.auth.validation,
): AuthFieldErrors {
  const errors = validateLogin(input, messages);
  const nickname = input.nickname.trim();

  if (
    input.password.length < 10 ||
    input.password.length > 72 ||
    !/[A-Za-z]/u.test(input.password) ||
    !/\d/u.test(input.password)
  ) {
    errors.password = messages.passwordRule;
  }
  if (nickname.length < 2 || nickname.length > 20) {
    errors.nickname = messages.nickname;
  }
  if (!input.termsAgreed) {
    errors.termsAgreed = messages.terms;
  }

  return errors;
}
