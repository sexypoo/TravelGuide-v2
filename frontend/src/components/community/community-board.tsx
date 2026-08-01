'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ReportMenu } from '@/components/reports/report-menu';
import {
  communityCategories,
  createCommunityPost,
  getCommunityPage,
  type CommunityCategory,
  type CommunityPost,
} from '@/lib/api/community';
import { actionableErrorMessage } from '@/lib/api/problem-details';

export const communityCategoryLabels: Record<CommunityCategory, string> = {
  TRAVEL_TIP: '여행 팁',
  TRANSPORT: '교통',
  FOOD: '맛집',
  PLACE: '장소',
  QUESTION: '궁금해요',
  OTHER: '기타',
};

function date(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

export function CommunityBoard({
  currentUserId,
}: {
  currentUserId: string;
}): React.JSX.Element {
  const [category, setCategory] = useState<CommunityCategory>();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [composerOpen, setComposerOpen] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadFirstPage(): Promise<void> {
      setLoading(true);
      setError(undefined);
      try {
        const page = await getCommunityPage(category);
        if (active) {
          setPosts(page.items);
          setCursor(page.nextCursor);
        }
      } catch (loadError: unknown) {
        if (active) {
          setError(
            actionableErrorMessage(
              loadError,
              '커뮤니티 글을 불러오지 못했습니다. 연결을 확인해 주세요.',
            ),
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadFirstPage();
    return () => {
      active = false;
    };
  }, [category]);

  async function loadMore(): Promise<void> {
    if (cursor === null) return;
    setLoading(true);
    setError(undefined);
    try {
      const page = await getCommunityPage(category, cursor);
      setPosts((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    } catch (loadError: unknown) {
      setError(
        actionableErrorMessage(
          loadError,
          '이전 글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setPending(true);
    setError(undefined);
    try {
      const created = await createCommunityPost({
        category: String(form.get('category')) as CommunityCategory,
        areaText: String(form.get('areaText') ?? '').trim() || undefined,
        title: String(form.get('title') ?? '').trim(),
        content: String(form.get('content') ?? '').trim(),
      });
      if (category === undefined || category === created.category) {
        setPosts((current) => [created, ...current]);
      } else {
        setCategory(created.category);
      }
      formElement.reset();
      setComposerOpen(false);
    } catch (submitError: unknown) {
      setError(
        actionableErrorMessage(
          submitError,
          '게시글을 올리지 못했습니다. 입력 내용과 연결을 확인해 주세요.',
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="communityPage">
      <header className="communityHero">
        <div>
          <p>OPEN TRAVEL DESK</p>
          <h1>여행자 커뮤니티</h1>
          <span>인증 전에도 여행 정보를 편하게 묻고 나눌 수 있어요.</span>
        </div>
        <button type="button" onClick={() => setComposerOpen((open) => !open)}>
          {composerOpen ? '작성 닫기' : '+ 정보 나누기'}
        </button>
      </header>

      {composerOpen && (
        <form
          className="communityComposer"
          onSubmit={(event) => void submit(event)}
        >
          <header>
            <strong>어떤 여행 정보를 나눌까요?</strong>
            <span>연락처나 정확한 숙소 위치 같은 개인정보는 적지 마세요.</span>
          </header>
          <div className="communityComposer__row">
            <label>
              분류
              <select name="category" defaultValue="TRAVEL_TIP">
                {communityCategories.map((item) => (
                  <option key={item} value={item}>
                    {communityCategoryLabels[item]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              지역 <small>선택</small>
              <input
                name="areaText"
                maxLength={60}
                placeholder="예: 부산, 도쿄"
              />
            </label>
          </div>
          <label>
            제목
            <input name="title" minLength={5} maxLength={100} required />
          </label>
          <label>
            내용
            <textarea
              name="content"
              minLength={10}
              maxLength={2000}
              rows={6}
              required
            />
          </label>
          <button type="submit" disabled={pending}>
            {pending ? '올리는 중…' : '커뮤니티에 올리기'}
          </button>
        </form>
      )}

      <div className="communityFilters" aria-label="게시글 분류">
        <button
          type="button"
          aria-pressed={category === undefined}
          onClick={() => setCategory(undefined)}
        >
          전체
        </button>
        {communityCategories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {communityCategoryLabels[item]}
          </button>
        ))}
      </div>

      {error !== undefined && (
        <p className="communityError" role="alert">
          {error}
        </p>
      )}
      {!loading && posts.length === 0 ? (
        <div className="communityEmpty">
          <strong>아직 도착한 여행 정보가 없어요</strong>
          <p>이 지역을 아는 첫 번째 여행자가 되어 주세요.</p>
        </div>
      ) : (
        <div className="communityFeed" aria-busy={loading}>
          {posts.map((post) => (
            <article key={post.id} className="communityCard">
              <Link href={`/app/community/${post.id}`}>
                <div className="communityCard__meta">
                  <span>{communityCategoryLabels[post.category]}</span>
                  {post.areaText !== null && <mark>⌖ {post.areaText}</mark>}
                </div>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
              </Link>
              <footer>
                <span>
                  {post.author.nickname} · {date(post.createdAt)}
                </span>
                <span>댓글 {post.commentCount}</span>
                {post.author.id !== currentUserId && !post.removed && (
                  <ReportMenu
                    targets={[
                      {
                        type: 'COMMUNITY_POST',
                        id: post.id,
                        label: '이 게시글',
                      },
                    ]}
                  />
                )}
              </footer>
            </article>
          ))}
        </div>
      )}
      {cursor !== null && (
        <button
          className="communityMore"
          type="button"
          onClick={() => void loadMore()}
          disabled={loading}
        >
          {loading ? '불러오는 중…' : '이전 글 더 보기'}
        </button>
      )}
    </div>
  );
}
