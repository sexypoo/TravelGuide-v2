'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { Button } from '@/components/ui';
import { useLocale, useMessages } from '@/i18n/client';
import {
  scoreTravelTest,
  TRAVEL_TEST_QUESTIONS,
  TRAVEL_TYPE_KEYS,
  travelTestQuestionsFor,
  type TravelTypeKey,
} from '@/lib/travel-test/content';
import { Critter } from './critter';
import styles from './travel-test.module.css';

const TOTAL = TRAVEL_TEST_QUESTIONS.length;

export function TravelTest(): React.JSX.Element {
  const router = useRouter();
  const t = useMessages().travelTest;
  const questions = travelTestQuestionsFor(useLocale());
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<TravelTypeKey[]>([]);
  const [finishing, setFinishing] = useState(false);

  function pick(type: TravelTypeKey): void {
    if (finishing) return;
    const next = [...answers.slice(0, step), type];
    setAnswers(next);
    if (step + 1 < TOTAL) {
      setStep(step + 1);
      return;
    }
    const result = scoreTravelTest(next);
    if (result !== null) {
      setFinishing(true);
      router.push(`/test/${result}`);
    }
  }

  if (step < 0) {
    return (
      <section className={styles.intro} aria-labelledby="travel-test-title">
        <div className={styles.cast}>
          {TRAVEL_TYPE_KEYS.map((key) => (
            <Critter key={key} type={key} className={styles.castItem} />
          ))}
        </div>
        <p className={styles.kicker}>{t.intro.kicker}</p>
        <h1 id="travel-test-title" className={styles.title}>
          {t.intro.titleLine1}
          <br />
          {t.intro.titleLine2}
        </h1>
        <p className={styles.lede}>{t.intro.lede}</p>
        <p className={styles.meta}>{t.intro.meta}</p>
        <Button size="lg" block onClick={() => setStep(0)}>
          {t.intro.start}
        </Button>
      </section>
    );
  }

  const question = questions[step];
  if (question === undefined) {
    return <p className={styles.lede}>{t.quiz.calculating}</p>;
  }

  return (
    <section className={styles.question} aria-labelledby="travel-test-question">
      <div className={styles.progressRow}>
        <button
          type="button"
          className={styles.back}
          onClick={() => setStep(step - 1)}
          aria-label={step === 0 ? t.quiz.backToIntro : t.quiz.previous}
        >
          <AppIcon name="arrow-left" />
        </button>
        <div
          className={styles.bar}
          role="progressbar"
          aria-label={t.quiz.progress}
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-valuenow={step + 1}
        >
          <span style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
        </div>
        <span className={styles.count}>
          {step + 1} / {TOTAL}
        </span>
      </div>
      <h1 id="travel-test-question" className={styles.questionText}>
        {question.text}
      </h1>
      <div className={styles.options}>
        {question.options.map((option) => (
          <button
            key={option.label}
            type="button"
            className={styles.option}
            aria-pressed={answers[step] === option.type}
            disabled={finishing}
            onClick={() => pick(option.type)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
