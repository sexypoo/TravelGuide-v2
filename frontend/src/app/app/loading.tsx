'use client';

import { Page } from '@/components/app/page';
import { useMessages } from '@/i18n/client';
import styles from './loading.module.css';

export default function AppLoading(): React.JSX.Element {
  const t = useMessages();
  return (
    <Page>
      <div className={styles.root} role="status" aria-busy="true">
        <span className="srOnly">{t.home.loading}</span>
        <div className={styles.header} aria-hidden="true">
          <span className={`${styles.block} ${styles.title}`} />
          <span className={`${styles.block} ${styles.copy}`} />
        </div>
        <div className={`${styles.block} ${styles.card}`} aria-hidden="true" />
        <div
          className={`${styles.block} ${styles.card} ${styles.cardShort}`}
          aria-hidden="true"
        />
      </div>
    </Page>
  );
}
