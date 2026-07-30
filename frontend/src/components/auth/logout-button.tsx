'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/lib/api/auth-client';

export function LogoutButton(): React.JSX.Element {
  const router = useRouter();
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
      setError('로그아웃하지 못했습니다. 다시 시도해 주세요.');
      setIsPending(false);
    }
  }

  return (
    <div className="logoutAction">
      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={isPending}
      >
        {isPending ? '로그아웃 중' : '로그아웃'}
      </button>
      <span aria-live="polite">{error}</span>
    </div>
  );
}
