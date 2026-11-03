import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  createCommunityComment,
  getCommunityPost,
  type CommunityPostDetail,
} from '@/lib/api/community';
import { ApiProblem } from '@/lib/api/problem-details';
import { CommunityDetail } from './community-detail';

jest.mock('../../lib/api/community', () => ({
  ...jest.requireActual('../../lib/api/community'),
  createCommunityComment: jest.fn(),
  getCommunityPost: jest.fn(),
}));

const detail: CommunityPostDetail = {
  id: 'post-1',
  author: { id: 'author-1', nickname: '도쿄여행자' },
  category: 'TRAVEL_TIP',
  areaText: '도쿄',
  title: '공항에서 시내로 이동하는 방법',
  content: '늦은 시간에는 공항버스 막차 시간을 먼저 확인하세요.',
  removed: false,
  commentCount: 0,
  comments: [],
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('CommunityDetail', () => {
  beforeEach(() => {
    jest.mocked(getCommunityPost).mockReset();
    jest.mocked(createCommunityComment).mockReset();
  });

  it('loads a post and appends a submitted comment', async () => {
    jest.mocked(getCommunityPost).mockResolvedValue(detail);
    jest.mocked(createCommunityComment).mockResolvedValue({
      id: 'comment-1',
      postId: detail.id,
      author: { id: 'viewer-1', nickname: '답변여행자' },
      content: '밤 열한 시까지 운행하는 노선을 이용했어요.',
      removed: false,
      createdAt: '2026-08-02T00:00:00.000Z',
      updatedAt: '2026-08-02T00:00:00.000Z',
    });
    render(<CommunityDetail postId={detail.id} currentUserId="viewer-1" />);

    expect(
      await screen.findByRole('heading', { name: detail.title }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('댓글로 경험을 보태세요'), {
      target: { value: ' 밤 열한 시까지 운행하는 노선을 이용했어요. ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '댓글 올리기' }));

    await waitFor(() =>
      expect(createCommunityComment).toHaveBeenCalledWith(
        detail.id,
        '밤 열한 시까지 운행하는 노선을 이용했어요.',
      ),
    );
    expect(await screen.findByText('댓글 1')).toBeInTheDocument();
    expect(screen.getByText('답변여행자')).toBeInTheDocument();
  });

  it('lets the user retry a post that failed to load', async () => {
    let rejectFirst: (reason: Error) => void = () => undefined;
    let resolveRetry: (value: CommunityPostDetail) => void = () => undefined;
    jest
      .mocked(getCommunityPost)
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectFirst = reject;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveRetry = resolve;
          }),
      );
    render(<CommunityDetail postId={detail.id} currentUserId="viewer-1" />);
    rejectFirst(new Error('offline'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('게시글을 불러오지 못했어요');
    expect(alert).toHaveTextContent('연결을 확인한 뒤 다시 시도해 주세요.');
    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));

    expect(screen.getByRole('button', { name: '불러오는 중…' })).toBeDisabled();
    resolveRetry(detail);
    expect(
      await screen.findByRole('heading', { name: detail.title }),
    ).toBeInTheDocument();
    expect(getCommunityPost).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a not-found state without retry for a missing post', async () => {
    jest.mocked(getCommunityPost).mockRejectedValue(
      new ApiProblem({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        code: 'COMMUNITY_POST_NOT_FOUND',
        detail: '게시글을 찾을 수 없습니다.',
        requestId: 'request-1',
      }),
    );
    render(<CommunityDetail postId={detail.id} currentUserId="viewer-1" />);

    expect(await screen.findByText('글을 찾을 수 없어요')).toBeInTheDocument();
    expect(
      screen.getByText('삭제됐거나 주소가 잘못됐을 수 있어요.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '커뮤니티 목록으로' }),
    ).toHaveAttribute('href', '/app/community');
    expect(
      screen.queryByRole('button', { name: '다시 불러오기' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/COMMUNITY_POST_NOT_FOUND/)).toBeNull();
  });

  it('keeps the post visible when a comment fails to send', async () => {
    jest.mocked(getCommunityPost).mockResolvedValue(detail);
    jest.mocked(createCommunityComment).mockRejectedValue(new Error('offline'));
    render(<CommunityDetail postId={detail.id} currentUserId="viewer-1" />);

    expect(
      await screen.findByRole('heading', { name: detail.title }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('댓글로 경험을 보태세요'), {
      target: { value: '막차는 밤 열한 시예요.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '댓글 올리기' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '댓글을 올리지 못했어요.',
    );
    expect(
      screen.getByRole('heading', { name: detail.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(detail.content)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '다시 불러오기' }),
    ).not.toBeInTheDocument();
  });
});
