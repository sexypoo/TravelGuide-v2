import type { Locale } from '@/i18n/config';
import { messagesFor } from '@/i18n/messages';
import type { CommunityCategory } from '../api/community';

/** Category labels in the given language (#80). */
export function communityCategoryLabelsFor(
  locale: Locale = 'ko',
): Record<CommunityCategory, string> {
  return messagesFor(locale).community.categories;
}

/** Korean labels, kept for callers that are not locale-aware yet. */
export const communityCategoryLabels: Record<CommunityCategory, string> =
  communityCategoryLabelsFor('ko');
