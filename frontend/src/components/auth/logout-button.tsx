'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMessages } from '@/i18n/client';
import { logout } from '@/lib/api/auth-client';
import styles from './auth.module.css';

export function LogoutButton(): React.JSX.Element {
  const router = useRouter();
  const t = useMessages();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout(): Promise<void> {
    setIsPending(true);
    setError(null);
    try {
      await logout();
      router.replace('/auth/login');
      router.refresh();
    } catch {
      setError(t.auth.logoutFailed);
      setIsPending(false);
    }
  }

  return (
    <div className={styles.logout}>
      <button
        className={styles.logoutButton}
        type="button"
        onClick={() => void handleLogout()}
        disabled={isPending}
      >
        {isPending ? t.auth.loggingOut : t.auth.logout}
      </button>
      <span className={styles.logoutError} aria-live="polite">
        {error}
      </span>
    </div>
  );
}
