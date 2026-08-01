import type { InfiniteData } from '@tanstack/react-query';
import type { ChatMessage, MessagePage } from '../api/messages';
import type {
  Answer,
  Question,
  QuestionDetail,
  QuestionPage,
} from '../api/questions';

export function mergeQuestionIntoFeed(
  current: InfiniteData<QuestionPage> | undefined,
  question: Question,
): InfiniteData<QuestionPage> | undefined {
  if (
    current === undefined ||
    current.pages.some((page) =>
      page.items.some((item) => item.id === question.id),
    )
  ) {
    return current;
  }
  const first = current.pages[0];
  if (first === undefined) return current;
  return {
    ...current,
    pages: [
      { ...first, items: [question, ...first.items] },
      ...current.pages.slice(1),
    ],
  };
}

export function mergeMessageIntoTimeline(
  current: InfiniteData<MessagePage> | undefined,
  message: ChatMessage,
): InfiniteData<MessagePage> | undefined {
  if (
    current === undefined ||
    current.pages.some((page) =>
      page.items.some((item) => item.id === message.id),
    )
  ) {
    return current;
  }
  const first = current.pages[0];
  if (first === undefined) return current;
  return {
    ...current,
    pages: [
      { ...first, items: [...first.items, message] },
      ...current.pages.slice(1),
    ],
  };
}

export function markMessagePromoted(
  current: InfiniteData<MessagePage> | undefined,
  sourceMessageId: string,
  topicId: string,
): InfiniteData<MessagePage> | undefined {
  if (current === undefined) return current;
  let changed = false;
  const pages = current.pages.map((page) => ({
    ...page,
    items: page.items.map((message) => {
      if (message.id !== sourceMessageId || message.topicId === topicId) {
        return message;
      }
      changed = true;
      return { ...message, topicId };
    }),
  }));
  return changed ? { ...current, pages } : current;
}

export function markMessageRemoved(
  current: InfiniteData<MessagePage> | undefined,
  messageId: string,
): InfiniteData<MessagePage> | undefined {
  if (current === undefined) return current;
  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.map((message) =>
        message.id === messageId
          ? {
              ...message,
              removed: true,
              content: '운영 정책에 따라 숨김 처리된 메시지입니다.',
              image: null,
              place: null,
              sharedTopic: null,
            }
          : message,
      ),
    })),
  };
}

export function mergeAnswerIntoDetail(
  current: QuestionDetail | undefined,
  answer: Answer,
): QuestionDetail | undefined {
  if (
    current === undefined ||
    current.id !== answer.questionId ||
    current.answers.some((item) => item.id === answer.id)
  ) {
    return current;
  }
  const answers = [...current.answers, answer].sort(
    (left, right) =>
      left.createdAt.localeCompare(right.createdAt) ||
      left.id.localeCompare(right.id),
  );
  return { ...current, answers, answerCount: answers.length };
}

export function incrementFeedAnswerCount(
  current: InfiniteData<QuestionPage> | undefined,
  questionId: string,
): InfiniteData<QuestionPage> | undefined {
  if (current === undefined) return current;
  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.map((question) =>
        question.id === questionId
          ? { ...question, answerCount: question.answerCount + 1 }
          : question,
      ),
    })),
  };
}

export function removeQuestionFromFeed(
  current: InfiniteData<QuestionPage> | undefined,
  questionId: string,
): InfiniteData<QuestionPage> | undefined {
  if (current === undefined) return current;
  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.filter((question) => question.id !== questionId),
    })),
  };
}

export function mergeQuestionUpdateIntoDetail(
  current: QuestionDetail | undefined,
  question: Question,
): QuestionDetail | undefined {
  if (current === undefined || current.id !== question.id) return current;
  return { ...current, ...question, answers: current.answers };
}

export function markRemovedContent(
  current: QuestionDetail | undefined,
  target: {
    targetType: 'QUESTION' | 'ANSWER';
    targetId: string;
    questionId: string;
  },
): QuestionDetail | undefined {
  if (current === undefined || current.id !== target.questionId) return current;
  if (target.targetType === 'QUESTION') {
    return {
      ...current,
      status: 'REMOVED',
      content: '운영 정책에 따라 숨김 처리된 질문입니다.',
      areaText: null,
      safetyNotice: null,
    };
  }
  return {
    ...current,
    answers: current.answers.map((answer) =>
      answer.id === target.targetId
        ? {
            ...answer,
            content: '운영 정책에 따라 숨김 처리된 답변입니다.',
            sourceUrl: null,
            removed: true,
          }
        : answer,
    ),
  };
}
