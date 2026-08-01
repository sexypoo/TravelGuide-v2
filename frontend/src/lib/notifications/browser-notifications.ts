export const BROWSER_NOTIFICATION_PREFERENCE_KEY =
  'travelguide:browser-notifications';

export type BrowserNotificationControlState =
  | 'loading'
  | 'unsupported'
  | 'blocked'
  | 'prompt'
  | 'disabled'
  | 'enabled';

interface NotificationHandle {
  onclick: ((event: Event) => void) | null;
  close: () => void;
}

interface NotificationRuntime {
  permission: NotificationPermission;
  preferenceEnabled: boolean;
  visibilityState: DocumentVisibilityState;
  create: (title: string, options: NotificationOptions) => NotificationHandle;
  focus: () => void;
  navigate: (url: string) => void;
}

export interface RealtimeNotificationInput {
  authorId: string;
  currentUserId: string;
  title: string;
  body: string;
  tag: string;
  url: string;
}

export function notificationControlState(): BrowserNotificationControlState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (window.Notification.permission === 'denied') return 'blocked';
  if (window.Notification.permission === 'default') return 'prompt';
  return readNotificationPreference() ? 'enabled' : 'disabled';
}

export function readNotificationPreference(): boolean {
  try {
    return (
      window.localStorage.getItem(BROWSER_NOTIFICATION_PREFERENCE_KEY) ===
      'enabled'
    );
  } catch {
    return false;
  }
}

export function writeNotificationPreference(enabled: boolean): void {
  try {
    if (enabled) {
      window.localStorage.setItem(
        BROWSER_NOTIFICATION_PREFERENCE_KEY,
        'enabled',
      );
    } else {
      window.localStorage.removeItem(BROWSER_NOTIFICATION_PREFERENCE_KEY);
    }
  } catch {
    // Browser privacy settings may deny storage without disabling room access.
  }
}

export function shouldDeliverRealtimeNotification(
  input: Pick<RealtimeNotificationInput, 'authorId' | 'currentUserId'>,
  runtime: Pick<
    NotificationRuntime,
    'permission' | 'preferenceEnabled' | 'visibilityState'
  >,
): boolean {
  return (
    runtime.permission === 'granted' &&
    runtime.preferenceEnabled &&
    runtime.visibilityState !== 'visible' &&
    input.authorId !== input.currentUserId
  );
}

function browserRuntime(): NotificationRuntime | null {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !('Notification' in window)
  ) {
    return null;
  }
  return {
    permission: window.Notification.permission,
    preferenceEnabled: readNotificationPreference(),
    visibilityState: document.visibilityState,
    create: (title, options) => new window.Notification(title, options),
    focus: () => window.focus(),
    navigate: (url) => window.location.assign(url),
  };
}

export function deliverRealtimeNotification(
  input: RealtimeNotificationInput,
  runtime = browserRuntime(),
): boolean {
  if (runtime === null || !shouldDeliverRealtimeNotification(input, runtime)) {
    return false;
  }
  try {
    const notification = runtime.create(input.title, {
      body: input.body,
      tag: input.tag,
    });
    notification.onclick = () => {
      runtime.focus();
      runtime.navigate(input.url);
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
}
