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

export function participantBadgeLabel(badge: ParticipantBadge): string {
  if (badge === 'VERIFIED_TRAVELER') return '인증 여행자';
  if (badge === 'VERIFIED_LOCAL') return '인증 현지인';
  return '여행자 · 현지인 인증';
}
