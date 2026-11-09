import type { Locale } from '@/i18n/config';
import { messagesFor } from '@/i18n/messages';
import { topics as koTopics } from '@/i18n/messages/ko/topics';
import type {
  AnswerSourceType,
  CrowdLevel,
  EntryStatus,
  QuestionCategory,
  QuestionStatus,
  QuestionUrgency,
} from '../api/questions';

type TopicLabels = ReturnType<typeof messagesFor>['topics']['labels'];

/** All topic label maps (category, urgency, status, crowd, entry, source, badge) for a locale. */
export function topicLabels(locale: Locale = 'ko'): TopicLabels {
  return messagesFor(locale).topics.labels;
}

export function categoryLabel(
  value: QuestionCategory,
  locale: Locale = 'ko',
): string {
  return topicLabels(locale).category[value];
}

export function urgencyLabel(
  value: QuestionUrgency,
  locale: Locale = 'ko',
): string {
  return topicLabels(locale).urgency[value];
}

export function statusLabel(
  value: QuestionStatus,
  locale: Locale = 'ko',
): string {
  return topicLabels(locale).status[value];
}

export function crowdLabel(value: CrowdLevel, locale: Locale = 'ko'): string {
  return topicLabels(locale).crowd[value];
}

export function entryLabel(value: EntryStatus, locale: Locale = 'ko'): string {
  return topicLabels(locale).entry[value];
}

export function sourceLabel(
  value: AnswerSourceType,
  locale: Locale = 'ko',
): string {
  return topicLabels(locale).source[value];
}

// Korean maps kept for existing callers; prefer the locale-aware helpers.
// Read from the Korean dictionary file directly so module cycles stay safe.
export const categoryLabels: Readonly<Record<QuestionCategory, string>> =
  koTopics.labels.category;
export const crowdLabels: Readonly<Record<CrowdLevel, string>> =
  koTopics.labels.crowd;
export const entryLabels: Readonly<Record<EntryStatus, string>> =
  koTopics.labels.entry;
export const urgencyLabels: Readonly<Record<QuestionUrgency, string>> =
  koTopics.labels.urgency;
export const statusLabels: Readonly<Record<QuestionStatus, string>> =
  koTopics.labels.status;
export const sourceLabels: Readonly<Record<AnswerSourceType, string>> =
  koTopics.labels.source;

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
