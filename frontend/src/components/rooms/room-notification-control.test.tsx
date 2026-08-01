import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BROWSER_NOTIFICATION_PREFERENCE_KEY } from '@/lib/notifications/browser-notifications';
import { RoomNotificationControl } from './room-notification-control';

const originalNotification = window.Notification;

function installNotification(permission: NotificationPermission): {
  requestPermission: jest.Mock;
} {
  const browserNotification = {
    permission,
    requestPermission: jest.fn(async () => {
      browserNotification.permission = 'granted';
      return 'granted' as NotificationPermission;
    }),
  };
  Object.defineProperty(window, 'Notification', {
    configurable: true,
    value: browserNotification,
  });
  return browserNotification;
}

afterEach(() => {
  window.localStorage.clear();
  if (originalNotification === undefined) {
    Reflect.deleteProperty(window, 'Notification');
  } else {
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: originalNotification,
    });
  }
});

describe('RoomNotificationControl', () => {
  it('requests permission only after a click and persists an enabled choice', async () => {
    const notification = installNotification('default');
    render(<RoomNotificationControl />);
    const button = await screen.findByRole('button', { name: '알림 켜기' });
    expect(notification.requestPermission).not.toHaveBeenCalled();

    fireEvent.click(button);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '알림 사용 중' }),
      ).toHaveAttribute('aria-pressed', 'true'),
    );
    expect(notification.requestPermission).toHaveBeenCalledTimes(1);
    expect(
      window.localStorage.getItem(BROWSER_NOTIFICATION_PREFERENCE_KEY),
    ).toBe('enabled');
  });

  it('does not request permission again after the browser blocks it', async () => {
    const notification = installNotification('denied');
    render(<RoomNotificationControl />);
    const button = await screen.findByRole('button', {
      name: '브라우저에서 차단됨',
    });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(notification.requestPermission).not.toHaveBeenCalled();
  });
});
