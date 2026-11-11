import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Critter } from '@/components/travel-test/critter';
import { RegionCourse } from '@/components/travel-test/region-course';
import { ShareActions } from '@/components/travel-test/share-actions';
import { ButtonLink, Card } from '@/components/ui';
import { getLocale, getMessages } from '@/i18n/server';
import {
  isTravelTypeKey,
  TRAVEL_TYPE_KEYS,
  travelTypesFor,
} from '@/lib/travel-test/content';
import { TestShell } from '../test-shell';
import styles from '../test.module.css';

type Params = Promise<{ type: string }>;

export const dynamicParams = false;

export function generateStaticParams(): { type: string }[] {
  return TRAVEL_TYPE_KEYS.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { type } = await params;
  if (!isTravelTypeKey(type)) return {};
  const travelType = travelTypesFor(await getLocale())[type];
  const t = (await getMessages()).travelTest.meta;
  return {
    title: t.resultTitle(travelType.name),
    description: t.resultDescription(travelType.tagline),
    openGraph: {
      title: t.resultOgTitle(travelType.name),
      description: t.resultOgDescription(travelType.tagline),
      // The OG images stay Korean in both languages.
      images: [`/test/og/${type}.png`],
    },
  };
}

export default async function TravelTypeResultPage({
  params,
}: {
  params: Params;
}): Promise<React.JSX.Element> {
  const { type } = await params;
  if (!isTravelTypeKey(type)) notFound();
  const types = travelTypesFor(await getLocale());
  const { common, travelTest: t } = await getMessages();
  const travelType = types[type];
  const match = types[travelType.match];

  return (
    <TestShell>
      <article className={styles.result} aria-labelledby="travel-type-name">
        <section
          className={styles.resultCard}
          style={{ '--type-color': travelType.color } as React.CSSProperties}
        >
          <p className={styles.resultYou}>{t.result.you}</p>
          <h1 id="travel-type-name" className={styles.resultName}>
            {travelType.name}
          </h1>
          <Critter type={type} onColor className={styles.resultCritter} />
          <p className={styles.resultTagline}>{travelType.tagline}</p>
          <ul className={styles.traits} aria-label={t.result.traitsLabel}>
            {travelType.traits.map((trait) => (
              <li key={trait}>{trait}</li>
            ))}
          </ul>
        </section>

        <Card>
          <p className={styles.description}>{travelType.description}</p>
          <ShareActions type={type} />
        </Card>

        <RegionCourse type={type} />

        <Card aria-labelledby="travel-type-match">
          <h2 id="travel-type-match" className={styles.sectionTitle}>
            {t.result.matchTitle}
          </h2>
          <Link className={styles.match} href={`/test/${travelType.match}`}>
            <Critter type={travelType.match} className={styles.matchCritter} />
            <span>
              <b>{match.name}</b>
              <small>{match.tagline}</small>
            </span>
          </Link>
        </Card>

        <section className={styles.cta} aria-labelledby="travel-type-cta">
          <h2 id="travel-type-cta" className={styles.ctaTitle}>
            {t.result.ctaTitle}
          </h2>
          <p className={styles.ctaText}>{t.result.ctaText}</p>
          <div className={styles.ctaActions}>
            <ButtonLink href="/auth/register" variant="light" size="lg" block>
              {common.register}
            </ButtonLink>
            <Link className={styles.ctaAgain} href="/test">
              {t.result.ctaAgain}
            </Link>
          </div>
        </section>

        <nav className={styles.others} aria-labelledby="travel-type-others">
          <h2 id="travel-type-others" className={styles.sectionTitle}>
            {t.result.othersTitle}
          </h2>
          <ul>
            {TRAVEL_TYPE_KEYS.map((key) => (
              <li key={key}>
                <Link
                  href={`/test/${key}`}
                  aria-current={key === type ? 'page' : undefined}
                >
                  <Critter type={key} className={styles.otherCritter} />
                  {types[key].name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </TestShell>
  );
}
