'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { TRAVEL_TYPES, type TravelTypeKey } from '@/lib/travel-test/content';
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
  const travelType = TRAVEL_TYPES[type];

  async function shareLink(): Promise<void> {
    const url = window.location.href;
    const text = `나는 ${travelType.name}! 너는 어떤 여행자야?`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: '여쭈어 여행자 유형 테스트',
          text,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setStatus({
        tone: 'info',
        text: '링크를 복사했어요. 친구에게 붙여 넣어 보세요.',
      });
    } catch (error) {
      if (isAbort(error)) return;
      setStatus({
        tone: 'error',
        text: '공유하지 못했어요. 주소창의 링크를 복사해 주세요.',
      });
    }
  }

  async function saveImage(): Promise<void> {
    const svg = critterRef.current?.querySelector('svg');
    if (svg === null || svg === undefined) return;
    setSaving(true);
    setStatus(null);
    try {
      const blob = await renderShareCard(type, svg);
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
      setStatus({
        tone: 'info',
        text: '이미지를 저장했어요. 스토리에 올려 보세요.',
      });
    } catch (error) {
      if (isAbort(error)) return;
      setStatus({
        tone: 'error',
        text: '이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.share}>
      <div className={styles.shareButtons}>
        <Button icon="send" onClick={() => void shareLink()}>
          결과 공유하기
        </Button>
        <Button
          variant="secondary"
          icon="image"
          disabled={saving}
          onClick={() => void saveImage()}
        >
          {saving ? '만드는 중…' : '이미지로 저장'}
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
