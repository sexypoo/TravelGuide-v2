'use client';

import { Button, ButtonLink, Card, EmptyState } from '@/components/ui';
import styles from './error.module.css';

export default function AdminMetricsError({
  reset,
}: {
  reset: () => void;
}): React.JSX.Element {
  return (
    <div className={styles.root}>
      <Card>
        <div role="alert">
          <EmptyState
            icon="alert"
            title="운영 지표를 불러오지 못했어요"
            description="잠시 뒤 다시 시도해 주세요. 계속되면 서버 상태를 확인해 주세요."
            action={
              <div className={styles.actions}>
                <Button
                  variant="primary"
                  size="md"
                  icon="refresh"
                  onClick={reset}
                >
                  다시 불러오기
                </Button>
                <ButtonLink variant="secondary" size="md" href="/admin">
                  관리자 홈으로
                </ButtonLink>
              </div>
            }
          />
        </div>
      </Card>
    </div>
  );
}
