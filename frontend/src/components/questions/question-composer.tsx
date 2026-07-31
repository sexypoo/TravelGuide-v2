'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useState } from 'react';
import {
  createQuestion,
  questionCategories,
  type CreateQuestionInput,
  type QuestionPage,
  type QuestionUrgency,
} from '@/lib/api/questions';
import { ApiProblem } from '@/lib/api/problem-details';
import { categoryLabels, urgencyLabels } from '@/lib/questions/presentation';
import { queryKeys } from '@/lib/query/keys';
import { mergeQuestionIntoFeed } from '@/lib/query/realtime-cache';

function questionError(error: unknown): string {
  if (error instanceof ApiProblem) {
    if (error.code === 'OPEN_QUESTION_LIMIT_REACHED') {
      return '진행 중인 질문은 한 방에서 최대 3개까지 작성할 수 있어요.';
    }
    if (error.code === 'TRAVELER_VERIFICATION_REQUIRED') {
      return '유효한 여행자 인증을 다시 확인해 주세요.';
    }
    return error.message;
  }
  return '질문을 보내지 못했습니다. 연결을 확인하고 다시 시도해 주세요.';
}

export function QuestionComposer({
  roomSlug,
  onCreated,
}: {
  roomSlug: string;
  onCreated?: () => void;
}): React.JSX.Element {
  const queryClient = useQueryClient();
  const [category, setCategory] =
    useState<CreateQuestionInput['category']>('PLACE');
  const [urgency, setUrgency] = useState<QuestionUrgency>('NORMAL');
  const [areaText, setAreaText] = useState('');
  const [content, setContent] = useState('');
  const [clientError, setClientError] = useState('');
  const mutation = useMutation({
    mutationFn: (input: CreateQuestionInput) => createQuestion(roomSlug, input),
    onSuccess: (question) => {
      queryClient.setQueryData<InfiniteData<QuestionPage>>(
        queryKeys.roomQuestions(roomSlug, 'OPEN'),
        (current) => mergeQuestionIntoFeed(current, question),
      );
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
      setClientError('상황을 이해할 수 있도록 질문을 20자 이상 적어 주세요.');
      return;
    }
    setClientError('');
    mutation.mutate({
      category,
      urgency,
      content: trimmedContent,
      ...(trimmedArea.length === 0 ? {} : { areaText: trimmedArea }),
    });
  }

  const message =
    clientError || (mutation.isError ? questionError(mutation.error) : '');

  return (
    <form className="questionComposer" onSubmit={submit} noValidate>
      <header>
        <span>TRAVELER SIGNAL</span>
        <h2>지금 필요한 판단을 물어보세요</h2>
        <p>
          현지인이 바로 확인할 수 있도록 상황과 장소를 구체적으로 적어 주세요.
        </p>
      </header>
      <fieldset className="composerChoices">
        <legend>질문 종류</legend>
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
      <label className="composerField">
        <span>
          질문 내용 <small>{Array.from(content).length}/1000</small>
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
      <p id="question-composer-help" className="composerHelp">
        안전 카테고리의 즉시 위험 상황은 답변보다 112·119에 먼저 연락하세요.
      </p>
      {message.length > 0 && (
        <p className="composerError" role="alert">
          {message}
        </p>
      )}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '질문 보내는 중' : '질문 보내기'}
      </button>
    </form>
  );
}
