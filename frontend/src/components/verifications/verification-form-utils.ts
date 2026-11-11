import { ko } from '@/i18n/messages/ko';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';

type VerificationMessages = typeof ko.verifications;

export const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);

export function proofError(
  file: File | undefined,
  messages: VerificationMessages['form'] = ko.verifications.form,
): string | undefined {
  if (file === undefined) return messages.proofMissing;
  if (!allowedTypes.has(file.type)) return messages.proofType;
  if (file.size > MAX_PROOF_BYTES) return messages.proofTooLarge;
  return undefined;
}

export function applicationError(
  error: unknown,
  messages: VerificationMessages = ko.verifications,
): string {
  if (error instanceof ApiProblem) {
    return (
      messages.errors[error.code] ??
      actionableErrorMessage(error, messages.form.submitFailed)
    );
  }
  return messages.form.submitFailed;
}

export function localDateToIso(value: string, endOfDay: boolean): string {
  const suffix = endOfDay ? 'T23:59:59.999' : 'T00:00:00.000';
  return new Date(`${value}${suffix}`).toISOString();
}
