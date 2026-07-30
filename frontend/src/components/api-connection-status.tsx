'use client';

import { useCallback, useEffect, useState } from 'react';
import { getLiveHealth, type HealthResponse } from '@/lib/api/health';

type ConnectionState =
  | { state: 'loading' }
  | { state: 'connected'; health: HealthResponse }
  | { state: 'error' };

export function ApiConnectionStatus(): React.JSX.Element {
  const [connection, setConnection] = useState<ConnectionState>({
    state: 'loading',
  });

  const checkConnection = useCallback(async (signal?: AbortSignal) => {
    setConnection({ state: 'loading' });

    try {
      const health = await getLiveHealth(signal);
      setConnection({ state: 'connected', health });
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      setConnection({ state: 'error' });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void checkConnection(controller.signal);

    return () => controller.abort();
  }, [checkConnection]);

  return (
    <div
      className={`apiStatus apiStatus--${connection.state}`}
      aria-live="polite"
    >
      <span className="apiStatus__dot" aria-hidden="true" />
      {connection.state === 'loading' && '서비스 연결 확인 중'}
      {connection.state === 'connected' && '서비스 정상 연결'}
      {connection.state === 'error' && (
        <>
          서비스 연결 안 됨
          <button type="button" onClick={() => void checkConnection()}>
            다시 확인
          </button>
        </>
      )}
    </div>
  );
}
