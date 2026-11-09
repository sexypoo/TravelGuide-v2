'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { useLocale, useMessages } from '@/i18n/client';
import { travelTypesFor, type TravelTypeKey } from '@/lib/travel-test/content';
import { renderShareCard } from '@/lib/travel-test/share-card';
import { Critter } from './critter';
import styles from './travel-test.module.css';

type Status = { tone: 'info' | 'error'; text: string } | null;

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function ShareActions({
  type,
}: {
  type: TravelTypeKey;
}): React.JSX.Element {
  const critterRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);
  const locale = useLocale();
  const t = useMessages().travelTest.share;
  const travelType = travelTypesFor(locale)[type];

  async function shareLink(): Promise<void> {
    const url = window.location.href;
    const text = t.text(travelType.name);
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: t.title,
          text,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setStatus({ tone: 'info', text: t.copied });
    } catch (error) {
      if (isAbort(error)) return;
      setStatus({ tone: 'error', text: t.shareFailed });
    }
  }

  async function saveImage(): Promise<void> {
    const svg = critterRef.current?.querySelector('svg');
    if (svg === null || svg === undefined) return;
    setSaving(true);
    setStatus(null);
    try {
      const blob = await renderShareCard(type, svg, locale);
      const file = new File([blob], `yeojjueo-${type}.png`, {
        type: 'image/png',
      });
      if (navigator.canShare?.({ files: [file] }) === true) {
        await navigator.share({ files: [file] });
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
      setStatus({ tone: 'info', text: t.saved });
    } catch (error) {
      if (isAbort(error)) return;
      setStatus({ tone: 'error', text: t.saveFailed });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.share}>
      <div className={styles.shareButtons}>
        <Button icon="send" onClick={() => void shareLink()}>
          {t.shareButton}
        </Button>
        <Button
          variant="secondary"
          icon="image"
          disabled={saving}
          onClick={() => void saveImage()}
        >
          {saving ? t.saving : t.saveButton}
        </Button>
      </div>
      <p
        className={
          status?.tone === 'error' ? styles.shareError : styles.shareStatus
        }
        role="status"
      >
        {status?.text}
      </p>
      <div ref={critterRef} hidden>
        <Critter type={type} onColor />
      </div>
    </div>
  );
}
