'use client';

import { Page } from '@/components/app/page';
import { Button, Card, EmptyState } from '@/components/ui';
import { useMessages } from '@/i18n/client';
import styles from './error.module.css';

export default function ErrorPage({
  reset,
}: {
  reset: () => void;
}): React.JSX.Element {
  const t = useMessages().home.error;
  return (
    <Page>
      <div className={styles.root}>
        <Card>
          <div role="alert">
            <EmptyState
              icon="alert"
              title={t.title}
              description={t.description}
              action={
                <Button
                  variant="primary"
                  size="md"
                  icon="refresh"
                  onClick={reset}
                >
                  {t.retry}
                </Button>
              }
            />
          </div>
        </Card>
      </div>
    </Page>
  );
}
