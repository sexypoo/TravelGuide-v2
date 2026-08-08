import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { AppFrame, isRoomDetailPath } from './app-frame';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockedUsePathname = jest.mocked(usePathname);

describe('AppFrame', () => {
  it('keeps global navigation on standard app pages', () => {
    mockedUsePathname.mockReturnValue('/app/community');

    render(
      <AppFrame chrome={<nav aria-label="앱 메뉴">메뉴</nav>}>
        <p>커뮤니티 화면</p>
      </AppFrame>,
    );

    expect(screen.getByRole('navigation', { name: '앱 메뉴' })).toBeVisible();
    expect(screen.getByText('커뮤니티 화면').closest('main')).not.toHaveClass(
      'appContent--room',
    );
  });

  it('hides global chrome and enables focus mode in a room detail', () => {
    mockedUsePathname.mockReturnValue('/app/rooms/jeju');

    render(
      <AppFrame chrome={<nav aria-label="앱 메뉴">메뉴</nav>}>
        <p>제주 실시간방</p>
      </AppFrame>,
    );

    expect(
      screen.queryByRole('navigation', { name: '앱 메뉴' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('제주 실시간방').closest('main')).toHaveClass(
      'appContent--room',
    );
    expect(screen.getByText('제주 실시간방').closest('main')).toHaveAttribute(
      'data-room-focused',
      'true',
    );
  });

  it('does not treat the room collection path as a detail route', () => {
    expect(isRoomDetailPath('/app/rooms')).toBe(false);
    expect(isRoomDetailPath('/app/rooms/jeju')).toBe(true);
    expect(isRoomDetailPath('/app/rooms/jeju/topics')).toBe(true);
  });
});
