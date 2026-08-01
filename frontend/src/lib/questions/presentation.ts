import type {
  AnswerSourceType,
  QuestionCategory,
  QuestionStatus,
  QuestionUrgency,
} from '../api/questions';

export const categoryLabels: Record<QuestionCategory, string> = {
  WEATHER: '날씨',
  TRANSPORT: '교통·이동',
  FOOD: '맛집·카페',
  PLACE: '장소 추천',
  WAITING: '대기 현황',
  CROWD: '혼잡도',
  OPEN_HOURS: '운영 여부',
  EVENT: '행사·이벤트',
  SAFETY: '안전',
  OTHER: '기타',
};

export const crowdLabels = {
  QUIET: '여유',
  MODERATE: '보통',
  BUSY: '많음',
  VERY_BUSY: '매우 많음',
} as const;

export const entryLabels = {
  OPEN: '입장 가능',
  LIMITED: '제한 입장',
  PAUSED: '입장 일시 중단',
  CLOSED: '입장 마감',
  UNKNOWN: '확인 필요',
} as const;

export const urgencyLabels: Record<QuestionUrgency, string> = {
  NORMAL: '오늘 중',
  URGENT: '1시간 내',
};

export const statusLabels: Record<QuestionStatus, string> = {
  OPEN: '진행 중',
  RESOLVED: '해결됨',
  REMOVED: '숨김',
  EXPIRED: '마감됨',
};

export const sourceLabels: Record<AnswerSourceType, string> = {
  ON_SITE_NOW: '지금 직접 확인',
  RECENT_EXPERIENCE: '최근 경험',
  OFFICIAL_SOURCE: '공식 정보',
  PERSONAL_OPINION: '개인 의견',
};

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export function formatChatTime(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export function formatChatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export function formatVerifiedDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}
