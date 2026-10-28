import type { ValidationError } from '@nestjs/common';

// Turns class-validator errors into one Korean sentence for the UI (#50).
// Messages a DTO already wrote in Korean pass through unchanged.

const FALLBACK = '입력값을 확인해 주세요.';

const fieldLabels: Readonly<Record<string, string>> = {
  accuracyMeters: '위치 정확도',
  address: '주소',
  answerId: '답변',
  areaText: '지역',
  bio: '소개',
  caption: '사진 설명',
  capturedAt: '촬영 시각',
  category: '카테고리',
  code: '코드',
  confirmation: '확인 문구',
  content: '내용',
  crowdLevel: '혼잡도',
  cursor: '목록 위치',
  decision: '처리 결정',
  destination: '여행지',
  destinationId: '여행지',
  detail: '상세 내용',
  email: '이메일',
  endedOn: '종료일',
  endsAt: '종료 일시',
  entryStatus: '입장 상태',
  googlePlaceId: '장소',
  latitude: '위도',
  localProofType: '현지인 증빙 종류',
  longitude: '경도',
  messageId: '메시지',
  mode: '방식',
  name: '이름',
  next: '이동할 주소',
  nickname: '닉네임',
  note: '메모',
  observedAt: '확인 시각',
  password: '비밀번호',
  placeName: '장소 이름',
  privacyConsent: '개인정보 동의',
  q: '검색어',
  questionId: '토픽',
  reason: '사유',
  sourceMessageId: '원본 메시지',
  sourceType: '답변 근거',
  sourceUrl: '출처 주소',
  startedOn: '시작일',
  startsAt: '시작 일시',
  state: '상태',
  status: '상태',
  targetId: '신고 대상',
  targetType: '신고 대상 종류',
  termsAgreed: '약관 동의',
  title: '제목',
  token: '인증 정보',
  travelStyles: '여행 스타일',
  type: '종류',
  urgency: '급한 정도',
  waitMinutes: '예상 대기 시간',
};

const HANGUL = /[가-힣]/u;

function hasFinalConsonant(word: string): boolean {
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return false;
  return (last - 0xac00) % 28 !== 0;
}

/** Topic particle 은/는 or object particle 을/를 for a Korean word. */
function withParticle(word: string, kind: 'topic' | 'object'): string {
  const final = hasFinalConsonant(word);
  if (kind === 'topic') return `${word}${final ? '은' : '는'}`;
  return `${word}${final ? '을' : '를'}`;
}

function numbersIn(message: string): number[] {
  return (message.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number);
}

export function koreanConstraintMessage(
  property: string,
  constraint: string,
  message: string,
): string {
  if (HANGUL.test(message)) return message;

  const label = fieldLabels[property] ?? '입력값';
  const [first] = numbersIn(message);

  switch (constraint) {
    case 'whitelistValidation':
      return '보낼 수 없는 항목이 들어 있어요.';
    case 'isNotEmpty':
    case 'isDefined':
      return `${withParticle(label, 'object')} 입력해 주세요.`;
    case 'maxLength':
      return first === undefined
        ? `${withParticle(label, 'topic')} 더 짧게 입력해 주세요.`
        : `${withParticle(label, 'topic')} ${first}자 이하로 입력해 주세요.`;
    case 'minLength':
      return first === undefined
        ? `${withParticle(label, 'object')} 입력해 주세요.`
        : `${withParticle(label, 'topic')} ${first}자 이상 입력해 주세요.`;
    case 'isLength':
      if (first !== undefined && message.includes('shorter')) {
        return `${withParticle(label, 'topic')} ${first}자 이하로 입력해 주세요.`;
      }
      if (first !== undefined && message.includes('longer')) {
        return `${withParticle(label, 'topic')} ${first}자 이상 입력해 주세요.`;
      }
      return `${withParticle(label, 'object')} 확인해 주세요.`;
    case 'min':
      return first === undefined
        ? `${withParticle(label, 'object')} 확인해 주세요.`
        : `${withParticle(label, 'topic')} ${first} 이상이어야 해요.`;
    case 'max':
      return first === undefined
        ? `${withParticle(label, 'object')} 확인해 주세요.`
        : `${withParticle(label, 'topic')} ${first} 이하여야 해요.`;
    case 'isInt':
      return `${withParticle(label, 'topic')} 정수로 입력해 주세요.`;
    case 'isEmail':
      return '올바른 이메일 주소를 입력해 주세요.';
    case 'arrayMaxSize':
      return first === undefined
        ? `${withParticle(label, 'object')} 확인해 주세요.`
        : `${withParticle(label, 'topic')} ${first}개까지 고를 수 있어요.`;
    default:
      return `${withParticle(label, 'object')} 확인해 주세요.`;
  }
}

export function firstValidationMessage(errors: ValidationError[]): string {
  for (const error of errors) {
    const [entry] = Object.entries(error.constraints ?? {});
    if (entry !== undefined) {
      const [constraint, message] = entry;
      return koreanConstraintMessage(error.property, constraint, message);
    }

    const childMessage = firstValidationMessage(error.children ?? []);
    if (childMessage !== FALLBACK) {
      return childMessage;
    }
  }

  return FALLBACK;
}

/** Size-limit message for an upload rejected before it reaches a handler. */
export function uploadTooLargeDetail(path: string): string {
  if (path.includes('/verifications')) {
    return '증빙 파일은 5MB 이하여야 합니다.';
  }
  if (path.includes('/users/me/avatar')) {
    return '프로필 사진은 5MB 이하여야 합니다.';
  }
  return '이미지는 10MB 이하여야 합니다.';
}
