import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiProblem } from '@/lib/api/problem-details';
import { createAnswer, createAnswerWithImage } from '@/lib/api/questions';
import { AnswerForm } from './answer-form';

jest.mock('../../lib/api/questions', () => ({
  ...jest.requireActual('../../lib/api/questions'),
  createAnswer: jest.fn(),
  createAnswerWithImage: jest.fn(),
}));

function oversizedImage(): File {
  const file = new File(['x'], 'big.jpg', { type: 'image/jpeg' });
  Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 + 1 });
  return file;
}

function renderForm(category: 'PLACE' | 'WAITING' = 'PLACE'): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <AnswerForm questionId="question-1" roomSlug="jeju" category={category} />
    </QueryClientProvider>,
  );
}

describe('AnswerForm', () => {
  beforeEach(() => {
    jest.mocked(createAnswer).mockReset();
    jest.mocked(createAnswerWithImage).mockReset();
  });

  it('requires a useful answer and an official HTTPS source', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('10자 이상');

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '지금 현장에서 직접 확인한 충분히 긴 답변입니다.' },
    });
    fireEvent.click(screen.getByLabelText('공식 정보'));
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('HTTPS 주소');
    expect(createAnswer).not.toHaveBeenCalled();
  });

  it('requires structured observations for waiting topics and submits them', async () => {
    jest.mocked(createAnswer).mockReturnValue(new Promise(() => undefined));
    renderForm('WAITING');
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '현재 대기줄 상황을 직접 확인해서 알려드립니다.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('하나 이상');

    fireEvent.change(screen.getByPlaceholderText('30'), {
      target: { value: '25' },
    });
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
    await waitFor(() =>
      expect(createAnswer).toHaveBeenCalledWith(
        'question-1',
        expect.objectContaining({
          waitMinutes: 25,
          sourceType: 'ON_SITE_NOW',
          observedAt: expect.any(String),
        }),
      ),
    );
  });

  it.each(['2000', '-5', '2.5'])(
    'blocks wait minutes outside 0-1440 whole minutes (%s)',
    (value) => {
      renderForm('WAITING');
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '현재 대기줄 상황을 직접 확인해서 알려드립니다.' },
      });
      fireEvent.change(screen.getByPlaceholderText('30'), {
        target: { value },
      });
      fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
      expect(screen.getByRole('alert')).toHaveTextContent(
        '예상 대기 시간은 0분부터 1440분(24시간)까지 정수로 적어 주세요.',
      );
      expect(createAnswer).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['0', 0],
    ['1440', 1440],
  ])('submits boundary wait minutes %s', async (value, expected) => {
    jest.mocked(createAnswer).mockReturnValue(new Promise(() => undefined));
    renderForm('WAITING');
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '현재 대기줄 상황을 직접 확인해서 알려드립니다.' },
    });
    fireEvent.change(screen.getByPlaceholderText('30'), {
      target: { value },
    });
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
    await waitFor(() =>
      expect(createAnswer).toHaveBeenCalledWith(
        'question-1',
        expect.objectContaining({ waitMinutes: expected }),
      ),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('blocks photos over 10MB before uploading them', async () => {
    jest.mocked(createAnswer).mockReturnValue(new Promise(() => undefined));
    renderForm();
    fireEvent.change(screen.getByLabelText('사진 선택'), {
      target: { files: [oversizedImage()] },
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      '사진은 10MB 이하로 선택해 주세요.',
    );
    expect(screen.queryByText('big.jpg')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '지금 현장에서 직접 확인한 충분히 긴 답변입니다.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
    await waitFor(() => expect(createAnswer).toHaveBeenCalled());
    expect(createAnswerWithImage).not.toHaveBeenCalled();
  });

  it('explains the 10MB photo limit when the server rejects the upload size', async () => {
    jest.mocked(createAnswer).mockRejectedValue(
      new ApiProblem({
        type: 'about:blank',
        title: 'Payload Too Large',
        status: 413,
        code: 'UPLOAD_TOO_LARGE',
        detail: '증빙 파일은 5MB 이하여야 합니다.',
        requestId: 'request-1',
      }),
    );
    renderForm();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '지금 현장에서 직접 확인한 충분히 긴 답변입니다.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '사진은 10MB 이하로 선택해 주세요.',
    );
    expect(screen.queryByText(/증빙/)).not.toBeInTheDocument();
  });
});
