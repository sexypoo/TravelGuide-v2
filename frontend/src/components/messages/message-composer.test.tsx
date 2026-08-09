import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MessageComposer } from './message-composer';

function renderComposer(onCreateTopic = jest.fn()): typeof onCreateTopic {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MessageComposer roomSlug="jeju" onCreateTopic={onCreateTopic} />
    </QueryClientProvider>,
  );
  return onCreateTopic;
}

describe('MessageComposer action menu', () => {
  it('opens photo, place, and topic choices only from the plus button', () => {
    renderComposer();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: '사진, 장소 또는 토픽 추가' }),
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /사진/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /장소/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /토픽/ })).toBeInTheDocument();
  });

  it('opens the selected tray or hands topic creation to the room', () => {
    const onCreateTopic = renderComposer();
    const add = screen.getByRole('button', {
      name: '사진, 장소 또는 토픽 추가',
    });

    fireEvent.click(add);
    fireEvent.click(screen.getByRole('menuitem', { name: /사진/ }));
    expect(screen.getByLabelText('사진 첨부')).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(add);
    fireEvent.click(screen.getByRole('menuitem', { name: /토픽/ }));
    expect(onCreateTopic).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText('사진 첨부')).not.toBeInTheDocument();
  });

  it('opens place selection as a dialog without shrinking the chat composer', () => {
    renderComposer();

    fireEvent.click(
      screen.getByRole('button', { name: '사진, 장소 또는 토픽 추가' }),
    );
    fireEvent.click(screen.getByRole('menuitem', { name: /장소/ }));

    expect(
      screen.getByRole('dialog', { name: '장소 보내기' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('지도 API 키를 설정하면 지도가 표시됩니다.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
