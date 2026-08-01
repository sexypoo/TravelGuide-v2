'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useState } from 'react';
import type { ChatMessage, MessagePage } from '@/lib/api/messages';
import {
  createQuestion,
  questionCategories,
  type CreateQuestionInput,
  type QuestionPage,
  type QuestionUrgency,
} from '@/lib/api/questions';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';
import { categoryLabels, urgencyLabels } from '@/lib/questions/presentation';
import { queryKeys } from '@/lib/query/keys';
import {
  markMessagePromoted,
  mergeQuestionIntoFeed,
} from '@/lib/query/realtime-cache';

function questionError(error: unknown): string {
  if (error instanceof ApiProblem) {
    if (error.code === 'OPEN_QUESTION_LIMIT_REACHED') {
      return '진행 중인 토픽은 한 방에서 최대 3개까지 만들 수 있어요.';
    }
    if (error.code === 'ROOM_PARTICIPANT_VERIFICATION_REQUIRED') {
      return '유효한 여행자 또는 현지인 인증을 다시 확인해 주세요.';
    }
    if (error.code === 'MESSAGE_ALREADY_PROMOTED') {
      return '이미 토픽으로 만든 메시지입니다.';
    }
    return actionableErrorMessage(
      error,
      '토픽을 만들지 못했습니다. 연결을 확인하고 다시 시도해 주세요.',
    );
  }
  return '토픽을 만들지 못했습니다. 연결을 확인하고 다시 시도해 주세요.';
}

export function QuestionComposer({
  roomSlug,
  sourceMessage,
  onCreated,
}: {
  roomSlug: string;
  sourceMessage?: ChatMessage;
  onCreated?: () => void;
}): React.JSX.Element {
  const queryClient = useQueryClient();
  const [category, setCategory] =
    useState<CreateQuestionInput['category']>('PLACE');
  const [urgency, setUrgency] = useState<QuestionUrgency>('NORMAL');
  const [areaText, setAreaText] = useState('');
  const [content, setContent] = useState(sourceMessage?.content ?? '');
  const [clientError, setClientError] = useState('');
  const mutation = useMutation({
    mutationFn: (input: CreateQuestionInput) => createQuestion(roomSlug, input),
    onSuccess: (question) => {
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
      setContent('');
      setAreaText('');
      setClientError('');
      onCreated?.();
    },
  });

  function submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmedContent = content.trim();
    const trimmedArea = areaText.trim();
    if (Array.from(trimmedContent).length < 20) {
      setClientError('상황을 이해할 수 있도록 내용을 20자 이상 적어 주세요.');
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
    clientError || (mutation.isError ? questionError(mutation.error) : '');

  return (
    <form className="questionComposer" onSubmit={submit} noValidate>
      <header>
        <span>LIVE TOPIC</span>
        <h2>
          {sourceMessage === undefined
            ? '새 토픽 만들기'
            : '이 메시지를 토픽으로 잇기'}
        </h2>
        <p>
          답변과 해결 과정을 남길 가치가 있는 상황을 구체적으로 정리해 주세요.
        </p>
      </header>
      <fieldset className="composerChoices">
        <legend>토픽 종류</legend>
        <div>
          {questionCategories.map((item) => (
            <label key={item}>
              <input
                type="radio"
                name="category"
                value={item}
                checked={category === item}
                onChange={() => setCategory(item)}
              />
              <span>{categoryLabels[item]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="composerChoices composerChoices--urgency">
        <legend>답변이 필요한 시간</legend>
        <div>
          {(['NORMAL', 'URGENT'] as const).map((item) => (
            <label key={item}>
              <input
                type="radio"
                name="urgency"
                value={item}
                checked={urgency === item}
                onChange={() => setUrgency(item)}
              />
              <span>{urgencyLabels[item]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="composerField">
        <span>
          지역·장소 <small>선택</small>
        </span>
        <input
          value={areaText}
          maxLength={60}
          placeholder="예: 제주공항 1층, 서귀포 중문"
          onChange={(event) => setAreaText(event.target.value)}
        />
      </label>
      {sourceMessage === undefined ? (
        <label className="composerField">
          <span>
            토픽 내용 <small>{Array.from(content).length}/1000</small>
          </span>
          <textarea
            value={content}
            minLength={20}
            maxLength={1000}
            rows={7}
            placeholder="현재 상황, 이미 확인한 내용, 결정해야 하는 시간을 함께 적어 주세요."
            aria-describedby="question-composer-help"
            aria-invalid={message.length > 0}
            onChange={(event) => setContent(event.target.value)}
          />
        </label>
      ) : (
        <div className="sourceMessagePreview">
          <span>원본 메시지</span>
          <p>{sourceMessage.content}</p>
        </div>
      )}
      <p id="question-composer-help" className="composerHelp">
        안전 카테고리의 즉시 위험 상황은 답변보다 112·119에 먼저 연락하세요.
      </p>
      {message.length > 0 && (
        <p className="composerError" role="alert">
          {message}
        </p>
      )}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '토픽 만드는 중' : '토픽 만들기'}
      </button>
    </form>
  );
}
