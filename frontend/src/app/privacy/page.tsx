import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalShell } from '@/components/legal/legal-shell';
import styles from '@/components/legal/legal.module.css';
import { getMessages } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getMessages()).legal.privacy;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function PrivacyPage(): Promise<React.JSX.Element> {
  const { legal } = await getMessages();
  const t = legal.privacy;
  return (
    <LegalShell
      copy={legal.shell}
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
    >
      <section>
        <h2>{t.infoTitle}</h2>
        <dl className={styles.ledger}>
          {t.info.map((item) => (
            <div key={item.term}>
              <dt>{item.term}</dt>
              <dd>{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2>{t.purposeTitle}</h2>
        <p>{t.purposeBody}</p>
      </section>

      <section>
        <h2>{t.retentionTitle}</h2>
        <p>{t.retentionBody}</p>
        <Link className={styles.inlineLink} href="/account-deletion">
          {t.retentionLink}
        </Link>
      </section>

      <section>
        <h2>{t.vendorsTitle}</h2>
        <p>{t.vendorsBody}</p>
      </section>

      <section>
        <h2>{t.choicesTitle}</h2>
        <p>{t.choicesBody}</p>
      </section>
    </LegalShell>
  );
}
