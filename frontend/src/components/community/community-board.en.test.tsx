import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '@/i18n/client';
import { getCommunityPage, type CommunityPost } from '@/lib/api/community';
import { communityCategoryLabelsFor } from '@/lib/community/presentation';
import { CommunityBoard } from './community-board';

jest.mock('../../lib/api/community', () => ({
  ...jest.requireActual('../../lib/api/community'),
  createCommunityPost: jest.fn(),
  getCommunityPage: jest.fn(),
}));

const post: CommunityPost = {
  id: 'post-1',
  author: { id: 'author-1', nickname: 'busan-fan' },
  category: 'FOOD',
  areaText: 'Busan',
  title: 'Early breakfast near the station',
  content: 'A few places open at 7 a.m. right by Busan Station.',
  removed: false,
  commentCount: 2,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('CommunityBoard in English (#80)', () => {
  it('renders the board, categories, and composer in English', async () => {
    jest
      .mocked(getCommunityPage)
      .mockResolvedValue({ items: [post], nextCursor: 'next' });
    render(
      <I18nProvider locale="en">
        <CommunityBoard currentUserId="viewer-1" />
      </I18nProvider>,
    );

    expect(await screen.findByText(post.title)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Community' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Food' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show older posts' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Write' })[0]!);
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Post to community' }),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/[가-힣]/);
  });

  it('keeps Korean category labels by default', () => {
    expect(communityCategoryLabelsFor().FOOD).toBe('맛집');
    expect(communityCategoryLabelsFor('en').FOOD).toBe('Food');
  });
});
