'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useState } from 'react';
import { AppIcon } from '@/components/common';
import { Button } from '@/components/ui';
import { useMessages } from '@/i18n/client';
import type { Messages } from '@/i18n/messages';
import {
  shareTopicMessage,
  type ChatMessage,
  type MessagePage,
} from '@/lib/api/messages';
import {
  createQuestion,
  createQuestionWithImage,
  questionCategories,
  type CreateQuestionInput,
  type QuestionPage,
  type QuestionUrgency,
} from '@/lib/api/questions';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';
import { queryKeys } from '@/lib/query/keys';
import {
  markMessagePromoted,
  mergeMessageIntoTimeline,
  mergeQuestionIntoFeed,
} from '@/lib/query/realtime-cache';
import styles from './composer.module.css';

function questionError(
  error: unknown,
  t: Messages['topics']['composer'],
): string {
  if (error instanceof ApiProblem) {
    return t.errors[error.code] ?? actionableErrorMessage(error, t.failed);
  }
  return t.failed;
}

export function QuestionComposer({
  roomSlug,
  sourceMessage,
  onCreated,
}: {
  roomSlug: string;
  sourceMessage?: ChatMessage;
  onCreated?: (result: { autoShared: boolean }) => void;
}): React.JSX.Element {
  const messages = useMessages();
  const t = messages.topics.composer;
  const labels = messages.topics.labels;
  const queryClient = useQueryClient();
  const [category, setCategory] =
    useState<CreateQuestionInput['category']>('PLACE');
  const [urgency, setUrgency] = useState<QuestionUrgency>('NORMAL');
  const [areaText, setAreaText] = useState('');
  const [content, setContent] = useState(sourceMessage?.content ?? '');
  const [image, setImage] = useState<File>();
  const [clientError, setClientError] = useState('');
  const mutation = useMutation({
    mutationFn: async (input: CreateQuestionInput) => {
      const question = await (image === undefined
        ? createQuestion(roomSlug, input)
        : createQuestionWithImage(roomSlug, input, image));
      try {
        return {
          question,
          sharedMessage: await shareTopicMessage(roomSlug, question.id),
        };
      } catch {
        return { question, sharedMessage: null };
      }
    },
    onSuccess: ({ question, sharedMessage }) => {
      queryClient.setQueryData<InfiniteData<QuestionPage>>(
        queryKeys.roomQuestions(roomSlug, 'OPEN'),
        (current) => mergeQuestionIntoFeed(current, question),
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.roomQuestionsRoot(roomSlug),
      });
      if (sourceMessage !== undefined) {
        queryClient.setQueryData<InfiniteData<MessagePage>>(
          queryKeys.roomMessages(roomSlug),
          (current) =>
            markMessagePromoted(current, sourceMessage.id, question.id),
        );
      }
      if (sharedMessage !== null) {
        queryClient.setQueryData<InfiniteData<MessagePage>>(
          queryKeys.roomMessages(roomSlug),
          (current) => mergeMessageIntoTimeline(current, sharedMessage),
        );
      }
      setContent('');
      setAreaText('');
      setImage(undefined);
      setClientError('');
      onCreated?.({ autoShared: sharedMessage !== null });
    },
  });

  function submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmedContent = content.trim();
    const trimmedArea = areaText.trim();
    if (Array.from(trimmedContent).length < 20) {
      setClientError(t.tooShort);
      return;
    }
    setClientError('');
    mutation.mutate({
      category,
      urgency,
      ...(sourceMessage === undefined
        ? { content: trimmedContent }
        : { sourceMessageId: sourceMessage.id }),
      ...(trimmedArea.length === 0 ? {} : { areaText: trimmedArea }),
    });
  }

  const message =
    clientError || (mutation.isError ? questionError(mutation.error, t) : '');

  return (
    <form method="post" className={styles.form} onSubmit={submit} noValidate>
      <header className={styles.head}>
        <h2>{sourceMessage === undefined ? t.titleNew : t.titleFromMessage}</h2>
        <p>{t.description}</p>
      </header>
      <fieldset className={styles.choices}>
        <legend>{t.categoryLegend}</legend>
        <div className={styles.options}>
          {questionCategories.map((item) => (
            <label key={item} className={styles.option}>
              <input
                type="radio"
                name="category"
                value={item}
                checked={category === item}
                onChange={() => setCategory(item)}
              />
              <span>{labels.category[item]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.choices}>
        <legend>{t.urgencyLegend}</legend>
        <div className={styles.options}>
          {(['NORMAL', 'URGENT'] as const).map((item) => (
            <label key={item} className={styles.option}>
              <input
                type="radio"
                name="urgency"
                value={item}
                checked={urgency === item}
                onChange={() => setUrgency(item)}
              />
              <span>{labels.urgency[item]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className={styles.field}>
        <span className={styles.label}>
          {t.area} <small>{t.optional}</small>
        </span>
        <input
          value={areaText}
          maxLength={60}
          placeholder={t.areaPlaceholder}
          onChange={(event) => setAreaText(event.target.value)}
        />
      </label>
      {sourceMessage === undefined ? (
        <>
          <label className={styles.field}>
            <span className={styles.label}>
              {t.content} <small>{Array.from(content).length}/1000</small>
            </span>
            <textarea
              value={content}
              minLength={20}
              maxLength={1000}
              rows={6}
              placeholder={t.contentPlaceholder}
              aria-describedby="question-composer-help"
              aria-invalid={message.length > 0}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>
          <div className={styles.picker}>
            <div className={styles.pickerInfo}>
              <span className={styles.pickerIcon} aria-hidden="true">
                <AppIcon name="image" />
              </span>
              <div>
                <strong>{messages.topics.shared.photo}</strong>
                <small>{t.photoHint}</small>
              </div>
            </div>
            {image === undefined ? (
              <label className={styles.pickerButton}>
                {messages.topics.shared.pickPhoto}
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
            ) : (
              <div className={styles.pickerSelected}>
                <span title={image.name}>{image.name}</span>
                <button type="button" onClick={() => setImage(undefined)}>
                  {t.removePhoto}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={styles.preview}>
          <span>{t.sourceMessage}</span>
          <p>{sourceMessage.content}</p>
        </div>
      )}
      <p id="question-composer-help" className={styles.help}>
        {t.safetyHelp}
      </p>
      {message.length > 0 && (
        <p className={styles.error} role="alert">
          {message}
        </p>
      )}
      <Button type="submit" size="lg" block disabled={mutation.isPending}>
        {mutation.isPending ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
