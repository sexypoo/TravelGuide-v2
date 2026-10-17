import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand/wordmark';
import { IconLink } from '@/components/ui';
import styles from './shell.module.css';

export function Page({ children }: { children: ReactNode }): React.JSX.Element {
  return <div className={styles.page}>{children}</div>;
}

/**
 * Sticky top bar on mobile and a large page heading on web. `brand` shows the
 * wordmark on mobile instead of a title (the home tab); the web layout
 * already shows the wordmark in the side navigation.
 */
export function PageHeader({
  title,
  description,
  backHref,
  backLabel = '뒤로',
  actions,
  brand = false,
}: {
  title: string;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  brand?: boolean;
}): React.JSX.Element {
  return (
    <header
      className={`${styles.header}${brand ? ` ${styles['header--brand']}` : ''}`}
    >
      {backHref !== undefined && (
        <IconLink
          className={styles.headerBack}
          href={backHref}
          icon="chevron-left"
          label={backLabel}
        />
      )}
      <div className={styles.headerText}>
        {brand ? (
          <>
            <Wordmark href="/app" />
            <h1 className="srOnly">{title}</h1>
          </>
        ) : (
          <>
            <h1>{title}</h1>
            {description !== undefined && <p>{description}</p>}
          </>
        )}
      </div>
      {actions !== undefined && (
        <div className={styles.headerActions}>{actions}</div>
      )}
    </header>
  );
}
