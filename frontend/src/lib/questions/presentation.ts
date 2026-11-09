import type { Locale } from '@/i18n/config';
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

const intlLocale: Readonly<Record<Locale, string>> = {
  ko: 'ko-KR',
  en: 'en-US',
};

export function formatDateTime(value: string, locale: Locale = 'ko'): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export function formatTopicCardTime(
  value: string,
  reference = new Date(),
  locale: Locale = 'ko',
): string {
  const timeZone = 'Asia/Seoul';
  const calendarDay = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  });
  const createdAt = new Date(value);
  if (calendarDay.format(createdAt) === calendarDay.format(reference)) {
    const time = new Intl.DateTimeFormat(intlLocale[locale], {
      hour: 'numeric',
      minute: '2-digit',
      timeZone,
    }).format(createdAt);
    return locale === 'en' ? `Today ${time}` : `오늘 ${time}`;
  }
  return new Intl.DateTimeFormat(intlLocale[locale], {
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(createdAt);
}

/** "방금", "12분 전", "3시간 전" (or English), then a short date. */
export function formatRelativeTime(
  value: string,
  reference = new Date(),
  locale: Locale = 'ko',
): string {
  const minutes = Math.floor(
    (reference.getTime() - new Date(value).getTime()) / 60_000,
  );
  const en = locale === 'en';
  if (minutes < 1) return en ? 'just now' : '방금';
  if (minutes < 60) return en ? `${minutes} min ago` : `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return en ? `${hours} hr ago` : `${hours}시간 전`;
  return new Intl.DateTimeFormat(intlLocale[locale], {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export function formatChatTime(value: string, locale: Locale = 'ko'): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export function formatChatDate(value: string, locale: Locale = 'ko'): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

export function formatVerifiedDate(
  value: string,
  locale: Locale = 'ko',
): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}
