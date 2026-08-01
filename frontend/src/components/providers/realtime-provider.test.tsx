import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { io } from 'socket.io-client';
import { deliverRealtimeNotification } from '@/lib/notifications/browser-notifications';
import { queryKeys } from '@/lib/query/keys';
import {
  RealtimeProvider,
  useRealtime,
  useRoomRealtime,
} from './realtime-provider';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));
jest.mock('../../lib/notifications/browser-notifications', () => ({
  deliverRealtimeNotification: jest.fn(),
}));

type Handler = (value?: unknown) => void;

function Probe({ enabled = true }: { enabled?: boolean }): React.JSX.Element {
  const state = useRoomRealtime('jeju', enabled);
  const { announcement } = useRealtime();
  return (
    <div>
      <span>{state}</span>
      <span>{announcement}</span>
    </div>
  );
}

function message(id: string): Record<string, unknown> {
  return {
    id,
    roomId: 'room-1',
    author: {
      id: 'local-1',
      nickname: '제주현지인',
      badge: 'VERIFIED_LOCAL',
    },
    type: 'TEXT',
    content: '현재 공항버스가 정상 운행 중입니다.',
    contentFormat: 'PLAIN_TEXT',
    removed: false,
    topicId: null,
    image: null,
    place: null,
    sharedTopic: null,
    createdAt: '2026-08-02T00:00:00.000Z',
    updatedAt: '2026-08-02T00:00:00.000Z',
  };
}

describe('RealtimeProvider', () => {
  const socketHandlers = new Map<string, Handler>();
  const managerHandlers = new Map<string, Handler>();
  const emit = jest.fn();
  const socket = {
    connected: true,
    on: jest.fn((event: string, handler: Handler) => {
      socketHandlers.set(event, handler);
    }),
    emit,
    removeAllListeners: jest.fn(),
    close: jest.fn(),
    io: {
      on: jest.fn((event: string, handler: Handler) => {
        managerHandlers.set(event, handler);
      }),
      removeAllListeners: jest.fn(),
    },
  };

  beforeEach(() => {
    socketHandlers.clear();
    managerHandlers.clear();
    emit.mockReset();
    socket.removeAllListeners.mockReset();
    socket.close.mockReset();
    socket.io.removeAllListeners.mockReset();
    jest.mocked(deliverRealtimeNotification).mockReset();
    jest.mocked(io).mockReturnValue(socket as never);
  });

  it('joins retained rooms, reports connection changes, and cleans up', () => {
    const queryClient = new QueryClient();
    const view = render(
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider currentUserId="traveler-1">
          <Probe />
        </RealtimeProvider>
      </QueryClientProvider>,
    );

    act(() => socketHandlers.get('connect')?.());
    expect(screen.getByText('connected')).toBeInTheDocument();
    expect(emit).toHaveBeenCalledWith('room.join', { roomSlug: 'jeju' });

    act(() => managerHandlers.get('reconnect_attempt')?.());
    expect(screen.getByText('reconnecting')).toBeInTheDocument();
    act(() => socketHandlers.get('connect_error')?.());
    expect(screen.getByText('offline')).toBeInTheDocument();

    view.rerender(
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider currentUserId="traveler-1">
          <Probe enabled={false} />
        </RealtimeProvider>
      </QueryClientProvider>,
    );
    expect(emit).toHaveBeenCalledWith('room.leave', { roomSlug: 'jeju' });
    view.unmount();
    expect(socket.removeAllListeners).toHaveBeenCalledTimes(1);
    expect(socket.io.removeAllListeners).toHaveBeenCalledTimes(1);
    expect(socket.close).toHaveBeenCalledTimes(1);
  });

  it('merges a new message once and exposes an accessible announcement', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.roomMessages('jeju'), {
      pages: [{ items: [], nextCursor: null }],
      pageParams: [null],
    });
    render(
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider currentUserId="traveler-1">
          <Probe />
        </RealtimeProvider>
      </QueryClientProvider>,
    );
    const envelope = {
      eventId: 'event-1',
      roomSlug: 'jeju',
      occurredAt: '2026-08-02T00:00:00.000Z',
      payload: message('message-1'),
    };

    act(() => socketHandlers.get('room.message.created')?.(envelope));
    expect(
      screen.getAllByText('제주현지인님의 새 메시지가 도착했습니다.'),
    ).toHaveLength(2);
    expect(deliverRealtimeNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: 'local-1',
        currentUserId: 'traveler-1',
        tag: 'room-message:message-1',
      }),
    );
    expect(queryClient.getQueryData(queryKeys.roomMessages('jeju'))).toEqual(
      expect.objectContaining({
        pages: [
          expect.objectContaining({
            items: [expect.objectContaining({ id: 'message-1' })],
          }),
        ],
      }),
    );

    act(() => socketHandlers.get('room.message.created')?.(envelope));
    expect(deliverRealtimeNotification).toHaveBeenCalledTimes(1);
  });
});
