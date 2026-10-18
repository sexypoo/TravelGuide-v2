'use client';

import { Page } from '@/components/app/page';
import { Button, Card, EmptyState } from '@/components/ui';
import styles from './error.module.css';

export default function ErrorPage({
  reset,
}: {
  reset: () => void;
}): React.JSX.Element {
  return (
    <Page>
      <div className={styles.root}>
        <Card>
          <div role="alert">
            <EmptyState
              icon="alert"
              title="화면을 불러오지 못했어요"
              description="연결 상태를 확인한 뒤 다시 시도해 주세요."
              action={
                <Button
                  variant="primary"
                  size="md"
                  icon="refresh"
                  onClick={reset}
                >
                  다시 불러오기
                </Button>
              }
            />
          </div>
        </Card>
      </div>
    </Page>
  );
}
