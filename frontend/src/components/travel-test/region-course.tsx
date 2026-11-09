'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { useLocale, useMessages } from '@/i18n/client';
import { travelTypesFor, type TravelTypeKey } from '@/lib/travel-test/content';
import { courseRegionsFor } from '@/lib/travel-test/courses';
import styles from './travel-test.module.css';

/** Sample day course for a travel type, with a region picker (#42). */
export function RegionCourse({
  type,
}: {
  type: TravelTypeKey;
}): React.JSX.Element | null {
  const locale = useLocale();
  const t = useMessages().travelTest.course;
  const regions = courseRegionsFor(locale);
  const [regionKey, setRegionKey] = useState(regions[0]?.key);
  const region =
    regions.find((candidate) => candidate.key === regionKey) ?? regions[0];
  if (region === undefined) return null;
  const travelType = travelTypesFor(locale)[type];

  return (
    <Card aria-labelledby="travel-type-course">
      <h2 id="travel-type-course" className={styles.courseTitle}>
        {t.title(travelType.name, region.name)}
      </h2>
      <div className={styles.regions} role="group" aria-label={t.regionsLabel}>
        {regions.map((candidate) => (
          <button
            key={candidate.key}
            type="button"
            className={styles.region}
            aria-pressed={candidate.key === region.key}
            onClick={() => setRegionKey(candidate.key)}
          >
            {candidate.name}
          </button>
        ))}
      </div>
      <p className={styles.courseNotice}>{t.notice}</p>
      <ol
        className={styles.course}
        style={{ '--type-color': travelType.color } as React.CSSProperties}
      >
        {region.courses[type].map((stop) => (
          <li key={stop.time}>
            <time>{stop.time}</time>
            <span>
              <b>{stop.place}</b>
              <small>{stop.note}</small>
            </span>
          </li>
        ))}
      </ol>
      <Link
        className={styles.courseRoom}
        href={`/app/rooms/${encodeURIComponent(region.key)}`}
      >
        {t.askRoom(region.name)}
      </Link>
    </Card>
  );
}
