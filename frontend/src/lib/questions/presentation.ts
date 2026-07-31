import type {
  AnswerSourceType,
  QuestionCategory,
  QuestionStatus,
  QuestionUrgency,
} from '../api/questions';

export const categoryLabels: Record<QuestionCategory, string> = {
  WEATHER: '날씨·운영',
  TRANSPORT: '교통·이동',
  FOOD: '식당·카페',
  PLACE: '대체 장소',
  SAFETY: '안전',
  OTHER: '기타',
};

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
