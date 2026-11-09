/** Widens a code map so lookups by any API error code type-check. */
function errorsByCode(map: Record<string, string>): Record<string, string> {
  return map;
}

export const auth = {
  login: {
    eyebrow: '다시 만나서 반가워요',
    title: '로그인',
    description: '여행지에서 필요한 정보와 대화를 이어서 확인하세요.',
    alternatePrompt: '아직 계정이 없나요?',
    alternateLabel: '계정 만들기',
  },
  register: {
    eyebrow: '여행 정보를 나누는 첫 단계',
    title: '계정 만들기',
    description: '커뮤니티는 가입 후 바로 이용할 수 있어요.',
    alternatePrompt: '이미 계정이 있나요?',
    alternateLabel: '로그인',
  },
  forgot: {
    eyebrow: '계정 다시 찾기',
    title: '비밀번호 재설정',
    description:
      '가입한 이메일로 30분 동안 사용할 수 있는 안전한 링크를 보내드려요.',
    alternatePrompt: '아직 계정이 없나요?',
    alternateLabel: '계정 만들기',
  },
  reset: {
    eyebrow: '새 비밀번호 만들기',
    title: '비밀번호 변경',
    description: '다른 서비스에서 사용하지 않는 새 비밀번호를 입력해 주세요.',
    alternatePrompt: '링크에 문제가 있나요?',
    alternateLabel: '새 링크 받기',
  },
  backToStart: '처음으로',
  form: {
    email: '이메일',
    nickname: '닉네임',
    nicknamePlaceholder: '2~20자로 입력해 주세요',
    password: '비밀번호',
    passwordPlaceholderRegister: '영문과 숫자를 포함해 10자 이상',
    passwordPlaceholderLogin: '비밀번호 입력',
    termsRequired: '필수',
    termsText: '서비스 이용약관과 개인정보 처리방침에 동의합니다.',
    termsMissing: '필수 약관에 동의해 주세요.',
    socialFailed:
      '소셜 로그인을 완료하지 못했습니다. 다시 시도하거나 다른 방법을 이용해 주세요.',
    or: '또는 간편하게',
    socialLabel: '소셜 로그인',
    google: 'Google로 계속하기',
    kakao: '카카오로 계속하기',
    apple: 'Apple로 계속하기',
    forgotPrompt: '비밀번호가 기억나지 않나요?',
    forgotLink: '비밀번호 재설정',
    submittingRegister: '가입 요청을 처리하고 있습니다.',
    submittingLogin: '로그인 요청을 처리하고 있습니다.',
  },
  errors: errorsByCode({
    EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다. 로그인해 주세요.',
    NICKNAME_ALREADY_EXISTS:
      '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.',
    INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
    VALIDATION_FAILED: '입력한 내용을 다시 확인해 주세요.',
  }),
  validation: {
    email: '이메일 형식을 확인해 주세요.',
    passwordMissing: '비밀번호를 입력해 주세요.',
    passwordRule: '영문과 숫자를 포함해 10~72자로 입력해 주세요.',
    nickname: '닉네임은 공백을 제외하고 2~20자로 입력해 주세요.',
    terms: '서비스 이용을 위해 필수 약관에 동의해 주세요.',
  },
  logout: '로그아웃',
  loggingOut: '로그아웃 중',
  logoutFailed: '로그아웃하지 못했습니다. 다시 시도해 주세요.',
  recovery: {
    expired:
      '재설정 링크가 만료되었거나 이미 사용되었습니다. 새 링크를 받아 주세요.',
    mailUnavailable:
      '현재 메일을 보낼 수 없습니다. 잠시 후 다시 시도해 주세요.',
    failed: '요청을 처리하지 못했습니다.',
    invalidEmail: '올바른 이메일 주소를 입력해 주세요.',
    mismatch: '새 비밀번호가 서로 일치하지 않습니다.',
    invalidLink: '재설정 링크가 올바르지 않습니다. 새 링크를 받아 주세요.',
    sentTitle: '메일을 확인해 주세요',
    doneTitle: '비밀번호가 변경됐어요',
    sentBody:
      '가입 여부와 관계없이 같은 안내를 보여드려요. 계정이 있다면 30분 동안 사용할 수 있는 링크를 보냈습니다.',
    doneBody:
      '새 비밀번호로 다시 로그인해 주세요. 기존 로그인 세션은 안전하게 종료됩니다.',
    backToLogin: '로그인으로 돌아가기',
    emailLabel: '가입한 이메일',
    newPassword: '새 비밀번호',
    confirmPassword: '새 비밀번호 확인',
    confirmPlaceholder: '한 번 더 입력해 주세요',
    sendMail: '재설정 메일 받기',
    savePassword: '새 비밀번호 저장',
  },
};
