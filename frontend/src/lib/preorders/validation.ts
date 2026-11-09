export interface PreorderDraft {
  name: string;
  email: string;
  privacyConsent: boolean;
}

export interface PreorderFieldErrors {
  name?: string;
  email?: string;
  privacyConsent?: string;
}

import { ko } from '@/i18n/messages/ko';

type PreorderValidationMessages = typeof ko.legal.preorder.validation;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePreorder(
  input: PreorderDraft,
  messages: PreorderValidationMessages = ko.legal.preorder.validation,
): PreorderFieldErrors {
  const errors: PreorderFieldErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  if (name.length === 0) errors.name = messages.nameMissing;
  else if (name.length > 30) errors.name = messages.nameTooLong;
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    errors.email = messages.email;
  }
  if (!input.privacyConsent) {
    errors.privacyConsent = messages.privacyConsent;
  }
  return errors;
}
