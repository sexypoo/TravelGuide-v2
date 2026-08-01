'use client';

import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { parseMessage, type MessagePage } from '@/lib/api/messages';
import {
  parseAnswer,
  parseQuestion,
  type QuestionDetail,
  type QuestionPage,
} from '@/lib/api/questions';
import { queryKeys } from '@/lib/query/keys';
import { deliverRealtimeNotification } from '@/lib/notifications/browser-notifications';
import {
  incrementFeedAnswerCount,
  markMessagePromoted,
  markMessageRemoved,
  markRemovedContent,
  mergeAnswerIntoDetail,
  mergeMessageIntoTimeline,
  mergeQuestionIntoFeed,
  mergeQuestionUpdateIntoDetail,
  removeQuestionFromFeed,
} from '@/lib/query/realtime-cache';

type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'offline';

interface RealtimeContextValue {
  connectionState: ConnectionState;
  announcement: string;
  retainRoom: (roomSlug: string) => () => void;
}

interface EventEnvelope {
  eventId: string;
  roomSlug: string;
  occurredAt: string;
  payload: unknown;
}

interface ServerEvents {
  'room.message.created': (event: unknown) => void;
  'room.question.created': (event: unknown) => void;
  'room.answer.created': (event: unknown) => void;
  'room.question.updated': (event: unknown) => void;
  'room.content.removed': (event: unknown) => void;
}

interface MembershipResult {
  ok: boolean;
  code?: string;
}

interface ClientEvents {
  'room.join': (
    input: { roomSlug: string },
    acknowledge?: (result: MembershipResult) => void,
  ) => void;
  'room.leave': (input: { roomSlug: string }) => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

function parseEnvelope(value: unknown): EventEnvelope {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('eventId' in value) ||
    !('roomSlug' in value) ||
    !('occurredAt' in value) ||
    !('payload' in value) ||
    typeof value.eventId !== 'string' ||
    typeof value.roomSlug !== 'string' ||
    typeof value.occurredAt !== 'string'
  ) {
    throw new Error('실시간 이벤트 형식이 올바르지 않습니다.');
  }
  return {
    eventId: value.eventId,
    roomSlug: value.roomSlug,
    occurredAt: value.occurredAt,
    payload: value.payload,
  };
}

function parseRemovedTarget(value: unknown): {
  targetType: 'MESSAGE' | 'QUESTION' | 'ANSWER';
  targetId: string;
  questionId: string | null;
} {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('targetType' in value) ||
    !('targetId' in value) ||
    !('questionId' in value) ||
    !['MESSAGE', 'QUESTION', 'ANSWER'].includes(String(value.targetType)) ||
    typeof value.targetId !== 'string' ||
    (value.questionId !== null && typeof value.questionId !== 'string')
  ) {
    throw new Error('콘텐츠 제거 이벤트 형식이 올바르지 않습니다.');
  }
  return {
    targetType: value.targetType as 'MESSAGE' | 'QUESTION' | 'ANSWER',
    targetId: value.targetId,
    questionId: value.questionId,
  };
}

export function RealtimeProvider({
  children,
  currentUserId,
}: Readonly<{
  children: React.ReactNode;
  currentUserId: string;
}>): React.JSX.Element {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket<ServerEvents, ClientEvents> | null>(null);
  const roomCounts = useRef(new Map<string, number>());
  const seenEvents = useRef(new Set<string>());
  const seenAnswers = useRef(new Set<string>());
  const connectedOnce = useRef(false);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('connecting');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const socket: Socket<ServerEvents, ClientEvents> = io({
      path: '/socket.io',
      addTrailingSlash: false,
      withCredentials: true,
    });
    socketRef.current = socket;

    function rejoinRooms(refetch: boolean): void {
      for (const roomSlug of roomCounts.current.keys()) {
        socket.emit('room.join', { roomSlug });
        if (refetch) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.roomQuestionsRoot(roomSlug),
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.roomMessages(roomSlug),
          });
        }
      }
      if (refetch) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.questionRoot,
        });
      }
    }

    socket.on('connect', () => {
      const isReconnect = connectedOnce.current;
      connectedOnce.current = true;
      setConnectionState('connected');
      rejoinRooms(isReconnect);
    });
    socket.io.on('reconnect_attempt', () => setConnectionState('reconnecting'));
    socket.on('disconnect', () => setConnectionState('reconnecting'));
    socket.on('connect_error', () => setConnectionState('offline'));
    socket.on('room.message.created', (value) => {
      try {
        const event = parseEnvelope(value);
        if (seenEvents.current.has(event.eventId)) return;
        seenEvents.current.add(event.eventId);
        const message = parseMessage(event.payload);
        queryClient.setQueryData<InfiniteData<MessagePage>>(
          queryKeys.roomMessages(event.roomSlug),
          (current) => mergeMessageIntoTimeline(current, message),
        );
        setAnnouncement(
          `${message.author.nickname}님의 새 메시지가 도착했습니다.`,
        );
        deliverRealtimeNotification({
          authorId: message.author.id,
          currentUserId,
          title: `${message.author.nickname}님의 새 메시지`,
          body:
            message.content ||
            (message.type === 'IMAGE'
              ? '현장 사진을 공유했어요.'
              : message.type === 'PLACE'
                ? '장소를 공유했어요.'
                : '토픽을 공유했어요.'),
          tag: `room-message:${message.id}`,
          url: `/app/rooms/${event.roomSlug}`,
        });
      } catch {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.roomRoot,
        });
      }
    });
    socket.on('room.question.created', (value) => {
      try {
        const event = parseEnvelope(value);
        if (seenEvents.current.has(event.eventId)) return;
        seenEvents.current.add(event.eventId);
        const question = parseQuestion(event.payload);
        queryClient.setQueryData<InfiniteData<QuestionPage>>(
          queryKeys.roomQuestions(event.roomSlug, 'OPEN'),
          (current) => mergeQuestionIntoFeed(current, question),
        );
        void queryClient.invalidateQueries({
          queryKey: queryKeys.roomQuestionsRoot(event.roomSlug),
        });
        const sourceMessageId = question.sourceMessageId;
        if (sourceMessageId !== null) {
          queryClient.setQueryData<InfiniteData<MessagePage>>(
            queryKeys.roomMessages(event.roomSlug),
            (current) =>
              markMessagePromoted(current, sourceMessageId, question.id),
          );
        }
      } catch {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.questionRoot,
        });
      }
    });
    socket.on('room.answer.created', (value) => {
      try {
        const event = parseEnvelope(value);
        if (seenEvents.current.has(event.eventId)) return;
        seenEvents.current.add(event.eventId);
        const answer = parseAnswer(event.payload);
        const alreadySeen = seenAnswers.current.has(answer.id);
        seenAnswers.current.add(answer.id);
        queryClient.setQueryData<QuestionDetail>(
          queryKeys.question(answer.questionId),
          (current) => mergeAnswerIntoDetail(current, answer),
        );
        void queryClient.invalidateQueries({
          queryKey: queryKeys.question(answer.questionId),
        });
        if (!alreadySeen) {
          queryClient.setQueriesData<InfiniteData<QuestionPage>>(
            { queryKey: queryKeys.roomQuestionsRoot(event.roomSlug) },
            (current) => incrementFeedAnswerCount(current, answer.questionId),
          );
          setAnnouncement(
            `${answer.author.nickname}님의 새 답변이 도착했습니다.`,
          );
          deliverRealtimeNotification({
            authorId: answer.author.id,
            currentUserId,
            title: `${answer.author.nickname}님의 새 토픽 답변`,
            body: answer.content,
            tag: `topic-answer:${answer.id}`,
            url: `/app/questions/${answer.questionId}`,
          });
        }
      } catch {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.questionRoot,
        });
      }
    });
    socket.on('room.question.updated', (value) => {
      try {
        const event = parseEnvelope(value);
        if (seenEvents.current.has(event.eventId)) return;
        seenEvents.current.add(event.eventId);
        const question = parseQuestion(event.payload);
        queryClient.setQueryData<QuestionDetail>(
          queryKeys.question(question.id),
          (current) => mergeQuestionUpdateIntoDetail(current, question),
        );
        queryClient.setQueryData<InfiniteData<QuestionPage>>(
          queryKeys.roomQuestions(event.roomSlug, 'OPEN'),
          (current) => removeQuestionFromFeed(current, question.id),
        );
        queryClient.setQueryData<InfiniteData<QuestionPage>>(
          queryKeys.roomQuestions(event.roomSlug, 'RESOLVED'),
          (current) =>
            question.status === 'RESOLVED'
              ? mergeQuestionIntoFeed(current, question)
              : removeQuestionFromFeed(current, question.id),
        );
        void queryClient.invalidateQueries({
          queryKey: queryKeys.roomQuestionsRoot(event.roomSlug),
        });
        setAnnouncement(
          question.status === 'EXPIRED'
            ? '마감 시간이 지나 토픽이 종료되었습니다.'
            : '토픽이 해결됨으로 변경되었습니다.',
        );
      } catch {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.questionRoot,
        });
      }
    });
    socket.on('room.content.removed', (value) => {
      try {
        const event = parseEnvelope(value);
        if (seenEvents.current.has(event.eventId)) return;
        seenEvents.current.add(event.eventId);
        const target = parseRemovedTarget(event.payload);
        if (target.targetType === 'MESSAGE') {
          queryClient.setQueryData<InfiniteData<MessagePage>>(
            queryKeys.roomMessages(event.roomSlug),
            (current) => markMessageRemoved(current, target.targetId),
          );
          setAnnouncement('운영 정책에 따라 메시지가 숨김 처리되었습니다.');
          return;
        }
        if (target.questionId === null) throw new Error('Question id missing');
        const questionTarget = {
          targetType: target.targetType as 'QUESTION' | 'ANSWER',
          targetId: target.targetId,
          questionId: target.questionId,
        };
        queryClient.setQueryData<QuestionDetail>(
          queryKeys.question(target.questionId),
          (current) => markRemovedContent(current, questionTarget),
        );
        if (target.targetType === 'QUESTION') {
          queryClient.setQueriesData<InfiniteData<QuestionPage>>(
            { queryKey: queryKeys.roomQuestionsRoot(event.roomSlug) },
            (current) =>
              removeQuestionFromFeed(current, questionTarget.questionId),
          );
        }
        void queryClient.invalidateQueries({
          queryKey: queryKeys.question(target.questionId),
        });
        setAnnouncement('운영 정책에 따라 콘텐츠가 숨김 처리되었습니다.');
      } catch {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.questionRoot,
        });
      }
    });

    return () => {
      socket.removeAllListeners();
      socket.io.removeAllListeners();
      socket.close();
      socketRef.current = null;
    };
  }, [currentUserId, queryClient]);

  const retainRoom = useCallback((roomSlug: string): (() => void) => {
    const nextCount = (roomCounts.current.get(roomSlug) ?? 0) + 1;
    roomCounts.current.set(roomSlug, nextCount);
    if (nextCount === 1 && socketRef.current?.connected === true) {
      socketRef.current.emit('room.join', { roomSlug });
    }
    return () => {
      const remaining = (roomCounts.current.get(roomSlug) ?? 1) - 1;
      if (remaining <= 0) {
        roomCounts.current.delete(roomSlug);
        socketRef.current?.emit('room.leave', { roomSlug });
      } else {
        roomCounts.current.set(roomSlug, remaining);
      }
    };
  }, []);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      connectionState,
      announcement,
      retainRoom,
    }),
    [announcement, connectionState, retainRoom],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
      <span className="srOnly" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (context === null) throw new Error('RealtimeProvider가 필요합니다.');
  return context;
}

export function useRoomRealtime(
  roomSlug: string,
  enabled: boolean,
): ConnectionState {
  const { connectionState, retainRoom } = useRealtime();
  useEffect(() => {
    if (!enabled) return undefined;
    return retainRoom(roomSlug);
  }, [enabled, retainRoom, roomSlug]);
  return connectionState;
}
