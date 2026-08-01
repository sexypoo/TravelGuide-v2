import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  createCommunityComment,
  getCommunityPost,
  type CommunityPostDetail,
} from '@/lib/api/community';
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

  it('shows a useful loading failure', async () => {
    jest.mocked(getCommunityPost).mockRejectedValue(new Error('offline'));
    render(<CommunityDetail postId={detail.id} currentUserId="viewer-1" />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '게시글을 불러오지 못했습니다.',
    );
  });
});
