import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Critter } from '@/components/travel-test/critter';
import { RegionCourse } from '@/components/travel-test/region-course';
import { ShareActions } from '@/components/travel-test/share-actions';
import { ButtonLink, Card } from '@/components/ui';
import {
  isTravelTypeKey,
  TRAVEL_TYPE_KEYS,
  TRAVEL_TYPES,
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
  const travelType = TRAVEL_TYPES[type];
  return {
    title: `나는 ${travelType.name} · 여행자 유형 테스트`,
    description: `${travelType.tagline}. 너는 어떤 여행자야? 1분 테스트로 알아봐요.`,
    openGraph: {
      title: `나는 ${travelType.name}`,
      description: `${travelType.tagline}. 너는 어떤 여행자야?`,
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
  const travelType = TRAVEL_TYPES[type];
  const match = TRAVEL_TYPES[travelType.match];

  return (
    <TestShell>
      <article className={styles.result} aria-labelledby="travel-type-name">
        <section
          className={styles.resultCard}
          style={{ '--type-color': travelType.color } as React.CSSProperties}
        >
          <p className={styles.resultYou}>나는</p>
          <h1 id="travel-type-name" className={styles.resultName}>
            {travelType.name}
          </h1>
          <Critter type={type} onColor className={styles.resultCritter} />
          <p className={styles.resultTagline}>{travelType.tagline}</p>
          <ul className={styles.traits} aria-label="이 유형의 특징">
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
            나랑 잘 맞는 여행자
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
            여행 중 막히면, 지금 그곳을 아는 사람에게
          </h2>
          <p className={styles.ctaText}>
            인증된 제주 현지인과 여행자가 모인 도움방에서 지금 상황을 물어볼 수
            있어요.
          </p>
          <div className={styles.ctaActions}>
            <ButtonLink href="/auth/register" variant="light" size="lg" block>
              계정 만들기
            </ButtonLink>
            <Link className={styles.ctaAgain} href="/test">
              나도 테스트 해보기
            </Link>
          </div>
        </section>

        <nav className={styles.others} aria-labelledby="travel-type-others">
          <h2 id="travel-type-others" className={styles.sectionTitle}>
            유형 8가지 구경하기
          </h2>
          <ul>
            {TRAVEL_TYPE_KEYS.map((key) => (
              <li key={key}>
                <Link
                  href={`/test/${key}`}
                  aria-current={key === type ? 'page' : undefined}
                >
                  <Critter type={key} className={styles.otherCritter} />
                  {TRAVEL_TYPES[key].name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </TestShell>
  );
}
