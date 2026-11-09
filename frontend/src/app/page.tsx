import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ApiConnectionStatus } from '@/components/api-connection-status';
import { Wordmark } from '@/components/brand/wordmark';
import { ButtonLink, Card, ListRow } from '@/components/ui';
import { LocaleSwitch } from '@/components/common/locale-switch';
import { getMessages } from '@/i18n/server';
import { getCurrentUser } from '@/lib/auth/session';
import styles from './public-home.module.css';

export default async function Home(): Promise<React.JSX.Element> {
  const [user, t] = await Promise.all([getCurrentUser(), getMessages()]);
  if (user !== null) {
    redirect(user.isAdmin ? '/admin' : '/app');
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Wordmark />
        <nav className={styles.headerNav} aria-label={t.publicHome.menuLabel}>
          <LocaleSwitch />
          <Link className={styles.headerTest} href="/test">
            {t.publicHome.travelTest}
          </Link>
          <Link className={styles.headerLogin} href="/auth/login">
            {t.common.login}
          </Link>
        </nav>
      </header>

      <div className={styles.body}>
        <section className={styles.hero} aria-labelledby="guest-title">
          <h1 id="guest-title" className={styles.title}>
            <span>{t.publicHome.titleLine1}</span>{' '}
            <span>{t.publicHome.titleLine2}</span>
          </h1>
          <p className={styles.lede}>{t.publicHome.lede}</p>

          <ol className={styles.steps} aria-label={t.publicHome.stepsLabel}>
            {t.publicHome.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <div className={styles.actions}>
            <ButtonLink
              href="/auth/login"
              id="guest-login"
              variant="light"
              size="lg"
              block
            >
              {t.common.login}
            </ButtonLink>
            <Link className={styles.register} href="/auth/register">
              {t.publicHome.firstTime} <strong>{t.common.register}</strong>
            </Link>
          </div>
        </section>

        <Card
          padding="list"
          className={styles.destinations}
          aria-labelledby="destinations-title"
        >
          <h2 id="destinations-title" className={styles.destinationsTitle}>
            {t.publicHome.destinationsTitle}
          </h2>
          <ListRow
            href="/auth/login?next=%2Fapp%2Frooms"
            icon="room"
            tone="magenta"
            title={t.publicHome.roomsTitle}
            description={t.publicHome.roomsDescription}
          />
          <ListRow
            href="/auth/login?next=%2Fapp%2Fcommunity"
            icon="community"
            tone="iris"
            title={t.publicHome.communityTitle}
            description={t.publicHome.communityDescription}
          />
          <ListRow
            href="/auth/login?next=%2Fapp%2Fverifications"
            icon="shield"
            tone="plum"
            title={t.publicHome.verificationTitle}
            description={t.publicHome.verificationDescription}
          />
        </Card>
      </div>

      <footer className={styles.footer}>
        <p className={styles.safety}>{t.publicHome.safety}</p>
        <div className={styles.footerMeta}>
          <ApiConnectionStatus />
          <nav aria-label={t.publicHome.policyLabel}>
            <Link href="/privacy">{t.publicHome.privacy}</Link>
            <Link href="/account-deletion">{t.publicHome.accountDeletion}</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
