'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { TRAVEL_TYPES, type TravelTypeKey } from '@/lib/travel-test/content';
import { COURSE_REGIONS } from '@/lib/travel-test/courses';
import styles from './travel-test.module.css';

/** Sample day course for a travel type, with a region picker (#42). */
export function RegionCourse({
  type,
}: {
  type: TravelTypeKey;
}): React.JSX.Element | null {
  const [regionKey, setRegionKey] = useState(COURSE_REGIONS[0]?.key);
  const region =
    COURSE_REGIONS.find((candidate) => candidate.key === regionKey) ??
    COURSE_REGIONS[0];
  if (region === undefined) return null;
  const travelType = TRAVEL_TYPES[type];

  return (
    <Card aria-labelledby="travel-type-course">
      <h2 id="travel-type-course" className={styles.courseTitle}>
        {travelType.name}에게 추천하는 {region.name}의 하루
      </h2>
      <div className={styles.regions} role="group" aria-label="지역 고르기">
        {COURSE_REGIONS.map((candidate) => (
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
      <p className={styles.courseNotice}>
        여쭈어가 고른 예시 코스예요. 아직 현지인이 확인하지 않았어요.
      </p>
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
    </Card>
  );
}
