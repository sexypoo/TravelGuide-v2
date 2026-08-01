import { parseCommunityPost } from './community';

const post = {
  id: 'post-1',
  author: {
    id: 'user-1',
    nickname: '여행메이트',
    email: 'private@example.com',
  },
  category: 'TRAVEL_TIP',
  areaText: '부산',
  title: '비 오는 날 부산역에서 이동하는 팁',
  content: '지하 연결 통로를 이용하면 우산을 오래 펼치지 않아도 됩니다.',
  removed: false,
  commentCount: 2,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
  privateModerationMemo: 'must-not-survive',
};

describe('community API contracts', () => {
  it('parses only public post fields without verification data', () => {
    const parsed = parseCommunityPost(post);

    expect(parsed).toMatchObject({
      id: 'post-1',
      category: 'TRAVEL_TIP',
      areaText: '부산',
      author: { id: 'user-1', nickname: '여행메이트' },
    });
    expect(JSON.stringify(parsed)).not.toMatch(
      /private@example|privateModerationMemo/,
    );
  });

  it('rejects unknown categories and malformed removed state', () => {
    expect(() =>
      parseCommunityPost({ ...post, category: 'UNVERIFIED' }),
    ).toThrow('커뮤니티 게시글 응답 형식');
    expect(() => parseCommunityPost({ ...post, removed: 'false' })).toThrow(
      '커뮤니티 게시글 응답 형식',
    );
  });
});
