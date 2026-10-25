import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { createImageMessage } from '@/lib/api/messages';
import { ApiProblem } from '@/lib/api/problem-details';
import { MessageComposer } from './message-composer';

jest.mock('../../lib/api/messages', () => ({
  ...jest.requireActual('../../lib/api/messages'),
  createImageMessage: jest.fn(),
}));

function imageFile(name: string, size: number): File {
  const file = new File(['x'], name, { type: 'image/jpeg' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function openPhotoTray(): HTMLInputElement {
  fireEvent.click(
    screen.getByRole('button', { name: '사진, 장소 또는 토픽 추가' }),
  );
  fireEvent.click(screen.getByRole('menuitem', { name: /사진/ }));
  const input = screen
    .getByLabelText('사진 첨부')
    .querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('photo input not found');
  return input;
}

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

    const dialog = screen.getByRole('dialog', { name: '장소 보내기' });
    expect(dialog).toBeInTheDocument();
    expect(dialog.closest('form')).toBeNull();
    expect(
      screen.getByText('지도 API 키를 설정하면 지도가 표시됩니다.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('MessageComposer photo size', () => {
  beforeEach(() => jest.mocked(createImageMessage).mockReset());

  it('blocks photos over 10MB before uploading them', () => {
    renderComposer();
    const input = openPhotoTray();
    fireEvent.change(input, {
      target: { files: [imageFile('big.jpg', 10 * 1024 * 1024 + 1)] },
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      '사진은 10MB 이하로 선택해 주세요.',
    );
    expect(screen.queryByText('big.jpg')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '메시지 보내기' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      '보낼 사진을 선택해 주세요.',
    );
    expect(createImageMessage).not.toHaveBeenCalled();
  });

  it('explains the 10MB photo limit when the server rejects the upload size', async () => {
    jest.mocked(createImageMessage).mockRejectedValue(
      new ApiProblem({
        type: 'about:blank',
        title: 'Payload Too Large',
        status: 413,
        code: 'UPLOAD_TOO_LARGE',
        detail: '증빙 파일은 5MB 이하여야 합니다.',
        requestId: 'request-1',
      }),
    );
    renderComposer();
    const input = openPhotoTray();
    fireEvent.change(input, {
      target: { files: [imageFile('ok.jpg', 10 * 1024 * 1024)] },
    });
    expect(screen.getByRole('button', { name: 'ok.jpg' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '메시지 보내기' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '사진은 10MB 이하로 선택해 주세요.',
    );
    expect(screen.queryByText(/증빙/)).not.toBeInTheDocument();
    expect(createImageMessage).toHaveBeenCalledTimes(1);
  });
});
