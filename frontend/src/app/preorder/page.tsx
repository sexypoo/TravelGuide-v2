import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';
import { AppIcon } from '@/components/common';
import { LocaleSwitch } from '@/components/common/locale-switch';
import { PreorderForm } from '@/components/preorders/preorder-form';
import { Card, IconTile } from '@/components/ui';
import { getMessages } from '@/i18n/server';
import { preorderProblems, preorderTrustPoints } from './content';
import styles from './preorder.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getMessages()).legal.preorder;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function PreorderPage(): Promise<React.JSX.Element> {
  const t = (await getMessages()).legal.preorder;
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Wordmark />
        <nav className={styles.headerNav} aria-label={t.navLabel}>
          <a href="#why-service">{t.navAbout}</a>
          <a href="#how-it-works">{t.navHow}</a>
          <a href="#preorder-form">{t.navPreorder}</a>
        </nav>
        <Link className={styles.login} href="/auth/login">
          {t.login}
        </Link>
        <LocaleSwitch />
      </header>

      <div className={styles.layout}>
        <div className={styles.story}>
          <section className={styles.hero} aria-labelledby="preorder-title">
            <p className={styles.heroKicker}>
              <AppIcon name="pin" /> {t.heroKicker}
            </p>
            <h1 id="preorder-title" className={styles.heroTitle}>
              {t.heroTitleLine1}
              <br />
              {t.heroTitleLine2}
            </h1>
            <p className={styles.heroText}>{t.heroText}</p>
            <div className={styles.heroActions}>
              <a className={styles.heroPrimary} href="#preorder-form">
                {t.heroPrimary} <AppIcon name="arrow-right" />
              </a>
              <a className={styles.heroSecondary} href="#how-it-works">
                {t.heroSecondary}
              </a>
            </div>
          </section>

          <Card
            id="why-service"
            className={styles.section}
            aria-labelledby="problem-title"
          >
            <h2 id="problem-title">{t.problemTitle}</h2>
            <p className={styles.sectionLede}>{t.problemLede}</p>
            <ul className={styles.problems}>
              {preorderProblems(t).map((problem) => (
                <li key={problem.title}>
                  <IconTile icon={problem.icon} tone="magenta" />
                  <div>
                    <h3>{problem.title}</h3>
                    <p>{problem.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            id="how-it-works"
            className={styles.section}
            aria-labelledby="how-title"
          >
            <h2 id="how-title">{t.howTitle}</h2>
            <p className={styles.sectionLede}>{t.howLede}</p>
            <ol className={styles.moments}>
              {t.moments.map((moment) => (
                <li key={moment.title}>
                  <h3>{moment.title}</h3>
                  <p>{moment.description}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card className={styles.section} aria-labelledby="trust-title">
            <h2 id="trust-title">{t.trustTitle}</h2>
            <p className={styles.sectionLede}>{t.trustLede}</p>
            <ul className={styles.trust}>
              {preorderTrustPoints(t).map((point) => (
                <li key={point.text}>
                  <AppIcon name={point.icon} /> {point.text}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <section
          className={styles.signup}
          id="preorder-form"
          aria-labelledby="signup-title"
        >
          <div className={styles.signupCopy}>
            <h2 id="signup-title">{t.signupTitle}</h2>
            <p>{t.signupBody}</p>
          </div>
          <Card as="aside" className={styles.formCard} aria-label={t.formLabel}>
            <PreorderForm />
          </Card>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>{t.footerTagline}</p>
        <nav aria-label={t.footerNavLabel}>
          <Link href="/privacy">{t.footerPrivacy}</Link>
        </nav>
        <span>{t.copyright}</span>
      </footer>
    </main>
  );
}
