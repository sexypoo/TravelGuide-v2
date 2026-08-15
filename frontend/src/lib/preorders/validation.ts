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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePreorder(input: PreorderDraft): PreorderFieldErrors {
  const errors: PreorderFieldErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  if (name.length === 0) errors.name = '이름을 입력해 주세요.';
  else if (name.length > 30) errors.name = '이름은 30자 이내로 입력해 주세요.';
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    errors.email = '올바른 이메일 주소를 입력해 주세요.';
  }
  if (!input.privacyConsent) {
    errors.privacyConsent = '개인정보 수집 동의가 필요합니다.';
  }
  return errors;
}
