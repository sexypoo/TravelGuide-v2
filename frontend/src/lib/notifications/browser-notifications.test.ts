import {
  deliverRealtimeNotification,
  shouldDeliverRealtimeNotification,
} from './browser-notifications';

const input = {
  authorId: 'local-id',
  currentUserId: 'traveler-id',
  title: '새 메시지',
  body: '현재 대기 줄이 짧아요.',
  tag: 'message:message-id',
  url: '/app/rooms/jeju',
};

describe('browser realtime notifications', () => {
  it('requires permission, preference, a hidden page, and another author', () => {
    const active = {
      permission: 'granted' as const,
      preferenceEnabled: true,
      visibilityState: 'hidden' as const,
    };
    expect(shouldDeliverRealtimeNotification(input, active)).toBe(true);
    expect(
      shouldDeliverRealtimeNotification(input, {
        ...active,
        visibilityState: 'visible',
      }),
    ).toBe(false);
    expect(
      shouldDeliverRealtimeNotification(
        { ...input, authorId: input.currentUserId },
        active,
      ),
    ).toBe(false);
    expect(
      shouldDeliverRealtimeNotification(input, {
        ...active,
        preferenceEnabled: false,
      }),
    ).toBe(false);
  });

  it('focuses, navigates, and closes when a delivered alert is clicked', () => {
    const close = jest.fn();
    const handle = {
      onclick: null as ((event: Event) => void) | null,
      close,
    };
    const runtime = {
      permission: 'granted' as const,
      preferenceEnabled: true,
      visibilityState: 'hidden' as const,
      create: jest.fn().mockReturnValue(handle),
      focus: jest.fn(),
      navigate: jest.fn(),
    };

    expect(deliverRealtimeNotification(input, runtime)).toBe(true);
    expect(runtime.create).toHaveBeenCalledWith(input.title, {
      body: input.body,
      tag: input.tag,
    });
    handle.onclick?.(new Event('click'));
    expect(runtime.focus).toHaveBeenCalledTimes(1);
    expect(runtime.navigate).toHaveBeenCalledWith(input.url);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
