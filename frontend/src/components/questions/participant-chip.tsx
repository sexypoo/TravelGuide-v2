import { Chip, type ChipTone } from '@/components/ui';
import {
  participantBadgeLabel,
  type ParticipantBadge,
} from '@/lib/api/participants';

/** Role by color: local = iris, traveler = magenta, both = plum. */
export function participantTone(badge: ParticipantBadge): ChipTone {
  if (badge === 'VERIFIED_LOCAL') return 'local';
  if (badge === 'VERIFIED_TRAVELER') return 'traveler';
  return 'plum';
}

export function participantAvatarTone(
  badge: ParticipantBadge,
): 'iris' | 'magenta' | 'plum' {
  if (badge === 'VERIFIED_LOCAL') return 'iris';
  if (badge === 'VERIFIED_TRAVELER') return 'magenta';
  return 'plum';
}

export function ParticipantChip({
  badge,
}: {
  badge: ParticipantBadge;
}): React.JSX.Element {
  return (
    <Chip tone={participantTone(badge)}>{participantBadgeLabel(badge)}</Chip>
  );
}
