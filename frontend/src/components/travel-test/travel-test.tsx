'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { Button } from '@/components/ui';
import {
  scoreTravelTest,
  TRAVEL_TEST_QUESTIONS,
  TRAVEL_TYPE_KEYS,
  type TravelTypeKey,
} from '@/lib/travel-test/content';
import { Critter } from './critter';
import styles from './travel-test.module.css';

const TOTAL = TRAVEL_TEST_QUESTIONS.length;

export function TravelTest(): React.JSX.Element {
  const router = useRouter();
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
        <p className={styles.kicker}>여쭈어 여행자 유형 테스트</p>
        <h1 id="travel-test-title" className={styles.title}>
          나는 어떤
          <br />
          여행자일까?
        </h1>
        <p className={styles.lede}>
          질문 10개로 내 여행 유형을 알아보고, 친구와 결과를 나눠 보세요.
        </p>
        <p className={styles.meta}>1분 · 로그인 없이 · 유형 8가지</p>
        <Button size="lg" block onClick={() => setStep(0)}>
          시작하기
        </Button>
      </section>
    );
  }

  const question = TRAVEL_TEST_QUESTIONS[step];
  if (question === undefined) {
    return <p className={styles.lede}>결과를 계산하고 있어요.</p>;
  }

  return (
    <section className={styles.question} aria-labelledby="travel-test-question">
      <div className={styles.progressRow}>
        <button
          type="button"
          className={styles.back}
          onClick={() => setStep(step - 1)}
          aria-label={step === 0 ? '처음 화면으로' : '이전 질문'}
        >
          <AppIcon name="arrow-left" />
        </button>
        <div
          className={styles.bar}
          role="progressbar"
          aria-label="진행도"
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
