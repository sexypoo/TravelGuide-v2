import type { Locale } from '@/i18n/config';
import { messagesFor } from '@/i18n/messages';

export type ParticipantKind = 'TRAVELER' | 'LOCAL' | 'BOTH';
export type ParticipantBadge =
  | 'VERIFIED_TRAVELER'
  | 'VERIFIED_LOCAL'
  | 'VERIFIED_BOTH';

export interface PublicParticipant {
  id: string;
  nickname: string;
  badge: ParticipantBadge;
}

export function isParticipantBadge(value: unknown): value is ParticipantBadge {
  return (
    value === 'VERIFIED_TRAVELER' ||
    value === 'VERIFIED_LOCAL' ||
    value === 'VERIFIED_BOTH'
  );
}

export function participantBadgeLabel(
  badge: ParticipantBadge,
  locale: Locale = 'ko',
): string {
  return messagesFor(locale).topics.labels.badge[badge];
}
