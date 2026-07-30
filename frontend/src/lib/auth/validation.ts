export interface AuthFieldErrors {
  email?: string;
  password?: string;
  nickname?: string;
  termsAgreed?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function validateLogin(input: {
  email: string;
  password: string;
}): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const email = input.email.trim();

  if (!emailPattern.test(email) || email.length > 320) {
    errors.email = '이메일 형식을 확인해 주세요.';
  }
  if (input.password.length === 0) {
    errors.password = '비밀번호를 입력해 주세요.';
  }

  return errors;
}

export function validateRegistration(input: {
  email: string;
  password: string;
  nickname: string;
  termsAgreed: boolean;
}): AuthFieldErrors {
  const errors = validateLogin(input);
  const nickname = input.nickname.trim();

  if (
    input.password.length < 10 ||
    input.password.length > 72 ||
    !/[A-Za-z]/u.test(input.password) ||
    !/\d/u.test(input.password)
  ) {
    errors.password = '영문과 숫자를 포함해 10~72자로 입력해 주세요.';
  }
  if (nickname.length < 2 || nickname.length > 20) {
    errors.nickname = '닉네임은 공백을 제외하고 2~20자로 입력해 주세요.';
  }
  if (!input.termsAgreed) {
    errors.termsAgreed = '서비스 이용을 위해 필수 약관에 동의해 주세요.';
  }

  return errors;
}
