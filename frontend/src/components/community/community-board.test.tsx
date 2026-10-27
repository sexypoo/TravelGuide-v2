import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  createCommunityPost,
  getCommunityPage,
  type CommunityPost,
} from '@/lib/api/community';
import { CommunityBoard } from './community-board';

jest.mock('../../lib/api/community', () => ({
  ...jest.requireActual('../../lib/api/community'),
  createCommunityPost: jest.fn(),
  getCommunityPage: jest.fn(),
}));

const post: CommunityPost = {
  id: 'post-1',
  author: { id: 'author-1', nickname: '부산여행자' },
  category: 'FOOD',
  areaText: '부산',
  title: '아침 일찍 여는 식당 정보',
  content: '부산역 근처에서 오전 일곱 시부터 식사할 수 있어요.',
  removed: false,
  commentCount: 2,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('CommunityBoard', () => {
  beforeEach(() => {
    jest.mocked(getCommunityPage).mockReset();
    jest.mocked(createCommunityPost).mockReset();
  });

  it('filters posts and appends the next page', async () => {
    jest
      .mocked(getCommunityPage)
      .mockResolvedValueOnce({ items: [post], nextCursor: 'next-page' })
      .mockResolvedValueOnce({
        items: [{ ...post, id: 'post-2', title: '두 번째 여행 정보' }],
        nextCursor: null,
      })
      .mockResolvedValueOnce({ items: [post], nextCursor: null });

    render(<CommunityBoard currentUserId="viewer-1" />);
    expect(await screen.findByText(post.title)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '이전 글 더 보기' }));
    expect(await screen.findByText('두 번째 여행 정보')).toBeInTheDocument();
    expect(getCommunityPage).toHaveBeenNthCalledWith(2, undefined, 'next-page');

    fireEvent.click(screen.getByRole('button', { name: '맛집' }));
    await waitFor(() =>
      expect(getCommunityPage).toHaveBeenLastCalledWith('FOOD'),
    );
    expect(screen.getByRole('button', { name: '맛집' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('creates a post from the open community composer', async () => {
    jest
      .mocked(getCommunityPage)
      .mockResolvedValue({ items: [], nextCursor: null });
    jest.mocked(createCommunityPost).mockResolvedValue(post);
    render(<CommunityBoard currentUserId="viewer-1" />);

    await screen.findByText('아직 도착한 여행 정보가 없어요');
    // The header button (web) and the floating button (mobile) both open it.
    fireEvent.click(screen.getAllByRole('button', { name: '글쓰기' })[0]!);
    fireEvent.change(screen.getByLabelText('분류'), {
      target: { value: 'FOOD' },
    });
    fireEvent.change(screen.getByLabelText(/지역/), {
      target: { value: ' 부산 ' },
    });
    fireEvent.change(screen.getByLabelText('제목'), {
      target: { value: post.title },
    });
    fireEvent.change(screen.getByLabelText('내용'), {
      target: { value: post.content },
    });
    fireEvent.click(screen.getByRole('button', { name: '커뮤니티에 올리기' }));

    await waitFor(() =>
      expect(createCommunityPost).toHaveBeenCalledWith({
        category: 'FOOD',
        areaText: '부산',
        title: post.title,
        content: post.content,
      }),
    );
    expect(await screen.findByText(post.title)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '커뮤니티에 올리기' }),
    ).not.toBeInTheDocument();
  });
  it('shows a retryable error instead of the empty state when the first page fails', async () => {
    jest
      .mocked(getCommunityPage)
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ items: [post], nextCursor: null });

    render(<CommunityBoard currentUserId="viewer-1" />);

    expect(
      await screen.findByText('커뮤니티 글을 불러오지 못했어요'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(
      screen.queryByText('아직 도착한 여행 정보가 없어요'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '이전 글 더 보기' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));

    expect(await screen.findByText(post.title)).toBeInTheDocument();
    expect(getCommunityPage).toHaveBeenCalledTimes(2);
    expect(getCommunityPage).toHaveBeenLastCalledWith(undefined);
    expect(
      screen.queryByText('커뮤니티 글을 불러오지 못했어요'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('retries the selected category after a failed load', async () => {
    jest
      .mocked(getCommunityPage)
      .mockResolvedValueOnce({ items: [post], nextCursor: null })
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ items: [], nextCursor: null });

    render(<CommunityBoard currentUserId="viewer-1" />);
    expect(await screen.findByText(post.title)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '맛집' }));
    expect(
      await screen.findByText('커뮤니티 글을 불러오지 못했어요'),
    ).toBeInTheDocument();
    // The previous category's posts must not linger behind the error.
    expect(screen.queryByText(post.title)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
    expect(
      await screen.findByText('아직 도착한 여행 정보가 없어요'),
    ).toBeInTheDocument();
    expect(getCommunityPage).toHaveBeenLastCalledWith('FOOD');
  });

  it('keeps the empty state for a successful load with no posts', async () => {
    jest
      .mocked(getCommunityPage)
      .mockResolvedValue({ items: [], nextCursor: null });

    render(<CommunityBoard currentUserId="viewer-1" />);

    expect(
      await screen.findByText('아직 도착한 여행 정보가 없어요'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('커뮤니티 글을 불러오지 못했어요'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
