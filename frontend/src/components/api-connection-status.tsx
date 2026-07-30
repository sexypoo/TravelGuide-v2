'use client';

import { useCallback, useEffect, useState } from 'react';
import { getLiveHealth, type HealthResponse } from '@/lib/api/health';

type ConnectionState =
  | { state: 'loading' }
  | { state: 'connected'; health: HealthResponse }
  | { state: 'error' };

function formatSignalTime(timestamp: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(new Date(timestamp));
}

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
    <section className="signalPanel" aria-labelledby="signal-title">
      <div className={`signalField signalField--${connection.state}`}>
        <div className="coordinateGrid" aria-hidden="true" />
        <div className="signalPoint signalPoint--traveler">
          <span className="signalPoint__dot" />
          <span className="signalPoint__label">여행자</span>
          <span className="signalPoint__coordinate">33.49° N</span>
        </div>
        <div className="signalRoute" aria-hidden="true">
          <span>질문 신호</span>
        </div>
        <div className="signalPoint signalPoint--local">
          <span className="signalPoint__dot" />
          <span className="signalPoint__label">제주 로컬</span>
          <span className="signalPoint__coordinate">126.53° E</span>
        </div>
      </div>

      <div className="connectionReadout" aria-live="polite">
        <div>
          <p className="readoutLabel" id="signal-title">
            API signal
          </p>
          {connection.state === 'loading' && (
            <p className="readoutValue">
              <span className="statusDot statusDot--loading" /> 연결 확인 중
            </p>
          )}
          {connection.state === 'connected' && (
            <p className="readoutValue">
              <span className="statusDot statusDot--connected" /> API 연결됨
            </p>
          )}
          {connection.state === 'error' && (
            <p className="readoutValue">
              <span className="statusDot statusDot--error" /> API 연결 안 됨
            </p>
          )}
        </div>

        <div className="readoutMeta">
          <code>GET /api/v1/health/live</code>
          {connection.state === 'connected' && (
            <span>
              마지막 신호 {formatSignalTime(connection.health.timestamp)} KST
            </span>
          )}
          {connection.state === 'error' && (
            <button type="button" onClick={() => void checkConnection()}>
              다시 연결
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
