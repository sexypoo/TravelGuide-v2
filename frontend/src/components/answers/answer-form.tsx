'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import composer from '@/components/questions/composer.module.css';
import { Button } from '@/components/ui';
import { useMessages } from '@/i18n/client';
import type { Messages } from '@/i18n/messages';
import {
  createAnswer,
  createAnswerWithImage,
  type AnswerSourceType,
  type CrowdLevel,
  type EntryStatus,
  type QuestionCategory,
  type QuestionDetail,
} from '@/lib/api/questions';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import { mergeAnswerIntoDetail } from '@/lib/query/realtime-cache';
import styles from './answer-form.module.css';

function answerError(
  error: unknown,
  t: Messages['topics']['answerForm'],
): string {
  if (error instanceof ApiProblem) {
    return t.errors[error.code] ?? actionableErrorMessage(error, t.failed);
  }
  return t.failed;
}

const crowdLevels: CrowdLevel[] = ['QUIET', 'MODERATE', 'BUSY', 'VERY_BUSY'];
const entryStatuses: EntryStatus[] = [
  'OPEN',
  'LIMITED',
  'PAUSED',
  'CLOSED',
  'UNKNOWN',
];

const sourceTypes: AnswerSourceType[] = [
  'ON_SITE_NOW',
  'RECENT_EXPERIENCE',
  'OFFICIAL_SOURCE',
  'PERSONAL_OPINION',
];

export function AnswerForm({
  questionId,
  roomSlug,
  category,
}: {
  questionId: string;
  roomSlug: string;
  category: QuestionCategory;
}): React.JSX.Element {
  const messages = useMessages();
  const t = messages.topics.answerForm;
  const labels = messages.topics.labels;
  const queryClient = useQueryClient();
  const [sourceType, setSourceType] = useState<AnswerSourceType>('ON_SITE_NOW');
  const [sourceUrl, setSourceUrl] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File>();
  const [waitMinutes, setWaitMinutes] = useState('');
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>();
  const [entryStatus, setEntryStatus] = useState<EntryStatus>();
  const [clientError, setClientError] = useState('');
  const mutation = useMutation({
    mutationFn: () => {
      const input = {
        content: content.trim(),
        sourceType,
        sourceUrl: sourceType === 'OFFICIAL_SOURCE' ? sourceUrl.trim() : null,
        ...(waitMinutes ? { waitMinutes: Number(waitMinutes) } : {}),
        ...(crowdLevel ? { crowdLevel } : {}),
        ...(entryStatus ? { entryStatus } : {}),
        ...(['WAITING', 'CROWD'].includes(category)
          ? { observedAt: new Date().toISOString() }
          : {}),
      };
      return image
        ? createAnswerWithImage(questionId, input, image)
        : createAnswer(questionId, input);
    },
    onSuccess: (answer) => {
      queryClient.setQueryData<QuestionDetail>(
        queryKeys.question(questionId),
        (current) => mergeAnswerIntoDetail(current, answer),
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.question(questionId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.roomQuestionsRoot(roomSlug),
      });
      setContent('');
      setImage(undefined);
      setSourceUrl('');
      setWaitMinutes('');
      setCrowdLevel(undefined);
      setEntryStatus(undefined);
      setClientError('');
    },
  });

  function submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (Array.from(content.trim()).length < 10) {
      setClientError(t.tooShort);
      return;
    }
    if (sourceType === 'OFFICIAL_SOURCE' && sourceUrl.trim().length === 0) {
      setClientError(t.sourceUrlMissing);
      return;
    }
    if (waitMinutes) {
      const minutes = Number(waitMinutes);
      if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1440) {
        setClientError(t.waitInvalid);
        return;
      }
    }
    if (
      ['WAITING', 'CROWD'].includes(category) &&
      !waitMinutes &&
      !crowdLevel &&
      !entryStatus
    ) {
      setClientError(t.observationMissing);
      return;
    }
    setClientError('');
    mutation.mutate();
  }

  const message =
    clientError || (mutation.isError ? answerError(mutation.error, t) : '');

  return (
    <form
      method="post"
      className={`${composer.form} ${styles.card}`}
      onSubmit={submit}
      noValidate
    >
      <header className={composer.head}>
        <h2>{t.title}</h2>
        <p>{t.description}</p>
      </header>
      <fieldset className={composer.choices}>
        <legend>{t.sourceLegend}</legend>
        <div className={composer.options}>
          {sourceTypes.map((item) => (
            <label key={item} className={composer.option}>
              <input
                type="radio"
                name="sourceType"
                checked={sourceType === item}
                onChange={() => setSourceType(item)}
              />
              <span>{labels.source[item]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {sourceType === 'OFFICIAL_SOURCE' && (
        <label className={composer.field}>
          <span className={composer.label}>{t.sourceUrl}</span>
          <input
            type="url"
            value={sourceUrl}
            maxLength={2048}
            placeholder="https://..."
            onChange={(event) => setSourceUrl(event.target.value)}
          />
        </label>
      )}
      {['WAITING', 'CROWD'].includes(category) && (
        <fieldset className={composer.observation}>
          <legend>{t.observationLegend}</legend>
          <div className={composer.observationGrid}>
            <label className={composer.field}>
              <span className={composer.label}>{t.waitLabel}</span>
              <div className={composer.suffix}>
                <input
                  type="number"
                  min="0"
                  max="1440"
                  step="1"
                  inputMode="numeric"
                  value={waitMinutes}
                  onChange={(event) => setWaitMinutes(event.target.value)}
                  placeholder="30"
                />
                <small>{t.minutes}</small>
              </div>
            </label>
            <label className={composer.field}>
              <span className={composer.label}>{t.crowdLabel}</span>
              <select
                value={crowdLevel ?? ''}
                onChange={(event) =>
                  setCrowdLevel(
                    event.target.value
                      ? (event.target.value as CrowdLevel)
                      : undefined,
                  )
                }
              >
                <option value="">{t.select}</option>
                {crowdLevels.map((item) => (
                  <option key={item} value={item}>
                    {labels.crowd[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className={composer.field}>
              <span className={composer.label}>{t.entryLabel}</span>
              <select
                value={entryStatus ?? ''}
                onChange={(event) =>
                  setEntryStatus(
                    event.target.value
                      ? (event.target.value as EntryStatus)
                      : undefined,
                  )
                }
              >
                <option value="">{t.select}</option>
                {entryStatuses.map((item) => (
                  <option key={item} value={item}>
                    {t.entryOptions[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p>{t.observationNote}</p>
        </fieldset>
      )}
      <label className={composer.field}>
        <span className={composer.label}>
          {t.content} <small>{Array.from(content).length}/1000</small>
        </span>
        <textarea
          value={content}
          minLength={10}
          maxLength={1000}
          rows={5}
          placeholder={t.contentPlaceholder}
          aria-invalid={message.length > 0}
          onChange={(event) => setContent(event.target.value)}
        />
      </label>
      <div className={composer.picker}>
        <div className={composer.pickerInfo}>
          <span className={composer.pickerIcon} aria-hidden="true">
            <AppIcon name="image" />
          </span>
          <div>
            <strong>{messages.topics.shared.photo}</strong>
            <small>{t.photoHint}</small>
          </div>
        </div>
        <div className={composer.fileRow}>
          {image && <strong title={image.name}>{image.name}</strong>}
          <label className={composer.pickerButton}>
            {image ? t.reselect : messages.topics.shared.pickPhoto}
            <input
              className="srOnly"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const nextImage = event.target.files?.[0];
                if (nextImage && nextImage.size > 10 * 1024 * 1024) {
                  setClientError(messages.topics.shared.photoTooLarge);
                  event.target.value = '';
                  return;
                }
                setImage(nextImage);
                setClientError('');
              }}
            />
          </label>
        </div>
      </div>
      {message.length > 0 && (
        <p className={composer.error} role="alert">
          {message}
        </p>
      )}
      <Button type="submit" size="lg" block disabled={mutation.isPending}>
        {mutation.isPending ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
