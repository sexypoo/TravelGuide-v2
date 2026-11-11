'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMessages } from '@/i18n/client';
import { getLiveHealth, type HealthResponse } from '@/lib/api/health';

type ConnectionState =
  | { state: 'loading' }
  | { state: 'connected'; health: HealthResponse }
  | { state: 'error' };

export function ApiConnectionStatus(): React.JSX.Element {
  const t = useMessages();
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
      {connection.state === 'loading' && t.common.connectionChecking}
      {connection.state === 'connected' && t.common.connectionOk}
      {connection.state === 'error' && (
        <>
          {t.common.connectionDown}
          <button type="button" onClick={() => void checkConnection()}>
            {t.common.connectionRecheck}
          </button>
        </>
      )}
    </div>
  );
}
