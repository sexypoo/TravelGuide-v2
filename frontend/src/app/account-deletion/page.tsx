import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui';
import { LegalShell } from '@/components/legal/legal-shell';
import styles from '@/components/legal/legal.module.css';
import { getMessages } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getMessages()).legal.accountDeletion;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function AccountDeletionPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}): Promise<React.JSX.Element> {
  const [params, { legal }] = await Promise.all([searchParams, getMessages()]);
  const deleted = params.deleted === 'true';
  const t = legal.accountDeletion;
  return (
    <LegalShell
      copy={legal.shell}
      eyebrow={t.eyebrow}
      title={deleted ? t.deletedTitle : t.title}
      description={deleted ? t.deletedDescription : t.description}
    >
      {deleted ? (
        <section className={styles.complete} role="status">
          <strong>{t.deletedWarning}</strong>
          <p>{t.deletedBody}</p>
          <ButtonLink href="/" variant="secondary">
            {t.home}
          </ButtonLink>
        </section>
      ) : (
        <>
          <section>
            <h2>{t.howTitle}</h2>
            <ol className={styles.steps}>
              {t.steps.map((step, index) => (
                <li key={step.title}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <ButtonLink
              href="/auth/login?next=%2Fapp%2Fprofile"
              size="lg"
              block
            >
              {t.loginCta}
            </ButtonLink>
          </section>

          <section>
            <h2>{t.scopeTitle}</h2>
            <ul className={styles.scope} aria-label={t.scopeLabel}>
              {t.scopeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{t.scopeBody}</p>
          </section>

          <section>
            <h2>{t.timingTitle}</h2>
            <p>{t.timingBody}</p>
          </section>
        </>
      )}
    </LegalShell>
  );
}
