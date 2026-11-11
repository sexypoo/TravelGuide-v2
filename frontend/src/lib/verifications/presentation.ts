import type { Locale } from '@/i18n/config';
import { messagesFor } from '@/i18n/messages';
import type { Verification, VerificationType } from '@/lib/api/verifications';

export interface QualificationPresentation {
  action: string;
  body: string;
  className?: string;
  href: string;
  title: string;
}

// City names are data (nameKo). English uses the known slugs and falls back
// to the Korean name for any city added later (#80).
import { destinationName } from '@/lib/rooms/presentation';

export { destinationName };

/** BCP 47 tag for Intl formatters in the profile and verification screens. */
export function intlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'ko-KR';
}

export function getQualificationPresentation(
  verifications: readonly Verification[],
  type: VerificationType,
  locale: Locale = 'ko',
): QualificationPresentation {
  const t = messagesFor(locale).verifications.qualification;
  const approved = verifications.find(
    (verification) =>
      verification.type === type && verification.status === 'APPROVED',
  );
  if (approved !== undefined) {
    const city = destinationName(approved.destination, locale);
    return {
      action: t.approvedAction,
      body:
        type === 'TRAVELER'
          ? t.approvedBodyTraveler(city)
          : t.approvedBodyLocal(city),
      className: 'qualificationApproved',
      href: '/app/verifications',
      title:
        type === 'TRAVELER'
          ? t.approvedTitleTraveler(city)
          : t.approvedTitleLocal(city),
    };
  }

  const pending = verifications.find(
    (verification) =>
      verification.type === type && verification.status === 'PENDING',
  );
  if (pending !== undefined) {
    return {
      action: t.pendingAction,
      body: t.pendingBody,
      className: 'qualificationPending',
      href: '/app/verifications',
      title: type === 'TRAVELER' ? t.pendingTitleTraveler : t.pendingTitleLocal,
    };
  }

  return type === 'TRAVELER'
    ? {
        action: t.startTravelerAction,
        body: t.startTravelerBody,
        href: '/app/verifications/traveler',
        title: t.startTravelerTitle,
      }
    : {
        action: t.startLocalAction,
        body: t.startLocalBody,
        href: '/app/verifications/local',
        title: t.startLocalTitle,
      };
}
