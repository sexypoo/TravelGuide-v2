'use client';

import { AppIcon } from '@/components/common';
import { useMessages } from '@/i18n/client';
import styles from './room.module.css';

import { useEffect, useState } from 'react';
import {
  notificationControlState,
  writeNotificationPreference,
  type BrowserNotificationControlState,
} from '@/lib/notifications/browser-notifications';

export function RoomNotificationControl(): React.JSX.Element {
  const t = useMessages().rooms.notifications;
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

  const copy = t[state];
  const unavailable =
    state === 'loading' || state === 'unsupported' || state === 'blocked';

  return (
    <div className={styles.notify} data-state={state}>
      <button
        type="button"
        className={styles.notifyButton}
        disabled={unavailable}
        aria-label={copy.label}
        aria-pressed={state === 'enabled'}
        aria-describedby="room-notification-detail"
        title={copy.detail}
        onClick={() => void toggle()}
      >
        <AppIcon name="bell" />
        <span className={styles.notifyLabel}>{copy.label}</span>
      </button>
      <span id="room-notification-detail" className="srOnly" role="status">
        {copy.detail}
      </span>
    </div>
  );
}
