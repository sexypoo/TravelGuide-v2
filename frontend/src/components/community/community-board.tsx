'use client';

import Link from 'next/link';
import { communityCategoryLabels } from '@/lib/community/presentation';
import { AppIcon } from '@/components/common';
import { Page, PageHeader } from '@/components/app/page';
import {
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  Notice,
  uiStyles,
} from '@/components/ui';
import { formatRelativeTime } from '@/lib/questions/presentation';
import styles from './community.module.css';
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

function date(value: string): string {
  return formatRelativeTime(value);
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

  const composeLabel = composerOpen ? '작성 닫기' : '글쓰기';

  return (
    <Page>
      <PageHeader
        title="커뮤니티"
        description="인증 없이도 여행 정보를 편하게 묻고 나눠요."
        actions={
          <span className={styles.webCompose}>
            <Button
              icon={composerOpen ? 'close' : 'pencil'}
              variant={composerOpen ? 'secondary' : 'primary'}
              onClick={() => setComposerOpen((open) => !open)}
            >
              {composeLabel}
            </Button>
          </span>
        }
      />

      {composerOpen && (
        <Card className={styles.composerCard} aria-label="새 글 쓰기">
          <form
            className={styles.form}
            method="post"
            onSubmit={(event) => void submit(event)}
          >
            <div className={styles.formHead}>
              <strong>어떤 여행 정보를 나눌까요?</strong>
              <span>
                연락처나 정확한 숙소 위치 같은 개인정보는 적지 마세요.
              </span>
            </div>
            <div className={styles.formRow}>
              <label className={styles.field}>
                <span>분류</span>
                <select name="category" defaultValue="TRAVEL_TIP">
                  {communityCategories.map((item) => (
                    <option key={item} value={item}>
                      {communityCategoryLabels[item]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>
                  지역 <small>선택</small>
                </span>
                <input
                  name="areaText"
                  maxLength={60}
                  placeholder="예: 부산, 도쿄"
                />
              </label>
            </div>
            <label className={styles.field}>
              <span>제목</span>
              <input name="title" minLength={5} maxLength={100} required />
            </label>
            <label className={styles.field}>
              <span>내용</span>
              <textarea
                name="content"
                minLength={10}
                maxLength={2000}
                rows={6}
                required
              />
            </label>
            <Button type="submit" size="lg" block disabled={pending}>
              {pending ? '올리는 중…' : '커뮤니티에 올리기'}
            </Button>
          </form>
        </Card>
      )}

      <div
        className={`${uiStyles.filters} ${styles.filters}`}
        aria-label="게시글 분류"
      >
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
        <div className={styles.error}>
          <Notice tone="danger" icon="alert" role="alert">
            {error}
          </Notice>
        </div>
      )}
      {!loading && posts.length === 0 ? (
        <Card>
          <EmptyState
            icon="community"
            tone="iris"
            title="아직 도착한 여행 정보가 없어요"
            description="이 지역을 아는 첫 번째 여행자가 되어 주세요."
          />
        </Card>
      ) : loading && posts.length === 0 ? (
        <Card padding="none" className={styles.feed} aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className={styles.skeleton} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          ))}
        </Card>
      ) : (
        <Card padding="none" className={styles.feed} aria-busy={loading}>
          {posts.map((post) => (
            <article key={post.id} className={styles.post}>
              <Link
                className={styles.postLink}
                href={`/app/community/${post.id}`}
              >
                <span className={styles.by}>
                  <Avatar name={post.author.nickname} size="sm" tone="iris" />
                  <b>{post.author.nickname}</b>
                  <span>{date(post.createdAt)}</span>
                </span>
                <h2 className={styles.title}>{post.title}</h2>
                <p className={styles.preview}>{post.content}</p>
              </Link>
              <footer className={styles.foot}>
                <Chip tone="plum">
                  {communityCategoryLabels[post.category]}
                </Chip>
                {post.areaText !== null && (
                  <Chip icon="pin">{post.areaText}</Chip>
                )}
                <span className={styles.comments}>
                  <AppIcon name="community" />
                  <span className="srOnly">댓글</span>
                  {post.commentCount}
                </span>
                {post.author.id !== currentUserId && !post.removed && (
                  <span className={styles.report}>
                    <ReportMenu
                      targets={[
                        {
                          type: 'COMMUNITY_POST',
                          id: post.id,
                          label: '이 게시글',
                        },
                      ]}
                    />
                  </span>
                )}
              </footer>
            </article>
          ))}
        </Card>
      )}
      {cursor !== null && (
        <Button
          className={styles.more}
          variant="secondary"
          block
          onClick={() => void loadMore()}
          disabled={loading}
        >
          {loading ? '불러오는 중…' : '이전 글 더 보기'}
        </Button>
      )}

      {!composerOpen && (
        <Button
          className={styles.fab}
          variant="live"
          size="lg"
          icon="pencil"
          onClick={() => {
            setComposerOpen(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          글쓰기
        </Button>
      )}
    </Page>
  );
}
