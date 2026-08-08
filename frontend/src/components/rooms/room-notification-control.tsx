'use client';

import { useEffect, useState } from 'react';
import {
  notificationControlState,
  writeNotificationPreference,
  type BrowserNotificationControlState,
} from '@/lib/notifications/browser-notifications';

const stateCopy: Record<
  BrowserNotificationControlState,
  { label: string; detail: string }
> = {
  loading: {
    label: '알림 확인 중',
    detail: '브라우저 상태를 확인하고 있어요.',
  },
  unsupported: {
    label: '알림 미지원',
    detail: '이 브라우저에서는 시스템 알림을 사용할 수 없어요.',
  },
  blocked: {
    label: '브라우저에서 차단됨',
    detail: '브라우저 사이트 설정에서 알림 권한을 허용해 주세요.',
  },
  prompt: {
    label: '알림 켜기',
    detail: '다른 탭을 보는 동안 새 메시지와 답변을 알려드려요.',
  },
  disabled: {
    label: '알림 꺼짐',
    detail: '이 브라우저에서 다시 알림을 받을 수 있어요.',
  },
  enabled: {
    label: '알림 사용 중',
    detail: '웹앱을 열어 둔 동안 백그라운드 소식을 알려드려요.',
  },
};

export function RoomNotificationControl(): React.JSX.Element {
  const [state, setState] =
    useState<BrowserNotificationControlState>('loading');

  useEffect(() => setState(notificationControlState()), []);

  async function toggle(): Promise<void> {
    if (state === 'enabled') {
      writeNotificationPreference(false);
      setState('disabled');
      return;
    }
    if (state === 'disabled') {
      writeNotificationPreference(true);
      setState('enabled');
      return;
    }
    if (state !== 'prompt') return;
    const permission = await window.Notification.requestPermission();
    if (permission === 'granted') writeNotificationPreference(true);
    setState(notificationControlState());
  }

  const copy = stateCopy[state];
  const unavailable =
    state === 'loading' || state === 'unsupported' || state === 'blocked';

  return (
    <div
      className={`roomNotificationControl roomNotificationControl--${state}`}
    >
      <button
        type="button"
        disabled={unavailable}
        aria-label={copy.label}
        aria-pressed={state === 'enabled'}
        aria-describedby="room-notification-detail"
        onClick={() => void toggle()}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.8 9.7a5.2 5.2 0 0 1 10.4 0c0 6 2.3 6.4 2.3 6.4h-15s2.3-.4 2.3-6.4Z" />
          <path d="M9.8 19h4.4" />
        </svg>
        <span>{copy.label}</span>
      </button>
      <span id="room-notification-detail" role="status">
        {copy.detail}
      </span>
    </div>
  );
}
