'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
import { sourceLabels } from '@/lib/questions/presentation';
import { queryKeys } from '@/lib/query/keys';
import { mergeAnswerIntoDetail } from '@/lib/query/realtime-cache';

function answerError(error: unknown): string {
  if (error instanceof ApiProblem) {
    const messages: Partial<Record<string, string>> = {
      ANSWER_LIMIT_REACHED: '이 질문에는 답변을 최대 3개까지 남길 수 있어요.',
      QUESTION_EXPIRED: '답변하는 동안 질문이 마감되었습니다.',
      QUESTION_NOT_OPEN: '이미 해결되었거나 닫힌 질문입니다.',
      SOURCE_URL_REQUIRED: '공식 정보의 HTTPS 주소를 입력해 주세요.',
      INVALID_SOURCE_URL: '출처 주소는 https://로 시작해야 합니다.',
    };
    return (
      messages[error.code] ??
      actionableErrorMessage(
        error,
        '답변을 보내지 못했습니다. 연결을 확인하고 다시 시도해 주세요.',
      )
    );
  }
  return '답변을 보내지 못했습니다. 연결을 확인하고 다시 시도해 주세요.';
}

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
      setClientError('현지 상황을 이해할 수 있도록 10자 이상 적어 주세요.');
      return;
    }
    if (sourceType === 'OFFICIAL_SOURCE' && sourceUrl.trim().length === 0) {
      setClientError('공식 정보의 HTTPS 주소를 함께 입력해 주세요.');
      return;
    }
    if (
      ['WAITING', 'CROWD'].includes(category) &&
      !waitMinutes &&
      !crowdLevel &&
      !entryStatus
    ) {
      setClientError('대기 시간, 혼잡도, 입장 상태 중 하나 이상 알려주세요.');
      return;
    }
    setClientError('');
    mutation.mutate();
  }

  const message =
    clientError || (mutation.isError ? answerError(mutation.error) : '');

  return (
    <form className="answerComposer" onSubmit={submit} noValidate>
      <header>
        <span>FIELD REPLY</span>
        <h2>이 질문에 근거 있는 답을 남겨주세요</h2>
        <p>
          직접 확인한 범위와 정보의 시점을 분명하게 적으면 여행자가 판단하기
          쉬워져요.
        </p>
      </header>
      <fieldset className="composerChoices answerSourceChoices">
        <legend>답변 근거</legend>
        <div>
          {sourceTypes.map((item) => (
            <label key={item}>
              <input
                type="radio"
                name="sourceType"
                checked={sourceType === item}
                onChange={() => setSourceType(item)}
              />
              <span>{sourceLabels[item]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {sourceType === 'OFFICIAL_SOURCE' && (
        <label className="composerField">
          <span>공식 HTTPS 주소</span>
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
        <fieldset className="fieldObservationFields">
          <legend>지금 직접 본 현장 상태</legend>
          <label>
            <span>예상 대기 시간</span>
            <div>
              <input
                type="number"
                min="0"
                max="1440"
                value={waitMinutes}
                onChange={(event) => setWaitMinutes(event.target.value)}
                placeholder="30"
              />
              <small>분</small>
            </div>
          </label>
          <label>
            <span>혼잡도</span>
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
              <option value="">선택</option>
              <option value="QUIET">여유</option>
              <option value="MODERATE">보통</option>
              <option value="BUSY">많음</option>
              <option value="VERY_BUSY">매우 많음</option>
            </select>
          </label>
          <label>
            <span>입장 상태</span>
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
              <option value="">선택</option>
              <option value="OPEN">입장 가능</option>
              <option value="LIMITED">제한 입장</option>
              <option value="PAUSED">일시 중단</option>
              <option value="CLOSED">입장 마감</option>
              <option value="UNKNOWN">확인 필요</option>
            </select>
          </label>
          <p>답변을 보내는 시각이 현장 확인 시각으로 함께 기록됩니다.</p>
        </fieldset>
      )}
      <label className="composerField">
        <span>
          답변 내용 <small>{Array.from(content).length}/1000</small>
        </span>
        <textarea
          value={content}
          minLength={10}
          maxLength={1000}
          rows={6}
          placeholder="지금 확인한 상황과 여행자가 취할 수 있는 선택을 적어 주세요."
          aria-invalid={message.length > 0}
          onChange={(event) => setContent(event.target.value)}
        />
      </label>
      <label className="answerImageField">
        <span>
          현장 사진 <small>선택 · 최대 10MB</small>
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => setImage(event.target.files?.[0])}
        />
        {image && <strong>{image.name}</strong>}
      </label>
      {message.length > 0 && (
        <p className="composerError" role="alert">
          {message}
        </p>
      )}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '답변 보내는 중' : '답변 보내기'}
      </button>
    </form>
  );
}
