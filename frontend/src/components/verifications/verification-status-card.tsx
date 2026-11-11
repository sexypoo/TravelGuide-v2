'use client';

import { AppIcon } from '@/components/common';
import {
  ButtonLink,
  Card,
  Chip,
  IconTile,
  Notice,
  type ChipTone,
} from '@/components/ui';
import type { Locale } from '@/i18n/config';
import { useLocale, useMessages } from '@/i18n/client';
import type { Verification, VerificationStatus } from '@/lib/api/verifications';
import { destinationName, intlLocale } from '@/lib/verifications/presentation';
import styles from './verification.module.css';

const tones: Readonly<Record<VerificationStatus, ChipTone>> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  REVOKED: 'neutral',
  EXPIRED: 'neutral',
};

type StepState = 'done' | 'current' | 'upcoming';

function date(value: string | null, locale: Locale): string | null {
  if (value === null) return null;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function steps(
  status: VerificationStatus,
  labels: readonly string[],
): ReadonlyArray<{ label: string; state: StepState }> {
  const [submitted = '', review = '', join = ''] = labels;
  return [
    { label: submitted, state: 'done' },
    { label: review, state: status === 'PENDING' ? 'current' : 'done' },
    { label: join, state: status === 'APPROVED' ? 'done' : 'upcoming' },
  ];
}

export function VerificationStatusCard({
  verification,
  canReapply,
}: {
  verification: Verification;
  /** False while a PENDING application of the same type exists (VER-001). */
  canReapply: boolean;
}): React.JSX.Element {
  const t = useMessages().verifications.status;
  const locale = useLocale();
  const isTraveler = verification.type === 'TRAVELER';
  const city = destinationName(verification.destination, locale);
  const validity = isTraveler
    ? `${date(verification.startsAt, locale)} – ${date(verification.endsAt, locale)}`
    : verification.expiresAt === null
      ? t.validDefault
      : t.validUntil(date(verification.expiresAt, locale) ?? '');

  return (
    <Card as="article" className={styles.status}>
      <div className={styles.statusHead} data-status={verification.status}>
        <div className={styles.statusTitle}>
          <IconTile
            icon={isTraveler ? 'map' : 'home'}
            tone={isTraveler ? 'magenta' : 'iris'}
          />
          <h3>{isTraveler ? t.travelerTitle(city) : t.localTitle(city)}</h3>
        </div>
        <Chip tone={tones[verification.status]}>
          {t.labels[verification.status]}
        </Chip>
      </div>
      <p className={styles.validity}>
        <AppIcon name="clock" />
        {validity}
      </p>
      <ol
        className={styles.progress}
        aria-label={t.progressLabel}
        data-status={verification.status}
      >
        {steps(verification.status, t.steps).map((step, index) => (
          <li
            key={step.label}
            data-state={step.state}
            aria-current={step.state === 'current' ? 'step' : undefined}
          >
            <span className={styles.stepDot} aria-hidden="true">
              {step.state === 'done' ? <AppIcon name="check" /> : index + 1}
            </span>
            <span className={styles.stepLabel}>{step.label}</span>
          </li>
        ))}
      </ol>
      {verification.status === 'REJECTED' &&
        verification.rejectionReason !== null && (
          <div className={styles.reason}>
            <Notice tone="danger" icon="alert">
              <strong className={styles.reasonTitle}>{t.reasonTitle}</strong>
              <span className={styles.reasonText}>
                {verification.rejectionReason}
              </span>
            </Notice>
            {canReapply && (
              <ButtonLink
                variant="secondary"
                size="sm"
                href={`/app/verifications/${isTraveler ? 'traveler' : 'local'}?city=${encodeURIComponent(verification.destination.slug)}`}
              >
                {t.reapply}
              </ButtonLink>
            )}
          </div>
        )}
      {verification.status === 'REVOKED' && (
        <p className={styles.support}>{t.revoked}</p>
      )}
    </Card>
  );
}
