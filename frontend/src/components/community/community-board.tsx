'use client';

import Link from 'next/link';
import { communityCategoryLabelsFor } from '@/lib/community/presentation';
import { useLocale, useMessages } from '@/i18n/client';
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
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const t = useMessages();
  const locale = useLocale();
  const copy = t.community.board;
  const categoryLabels = communityCategoryLabelsFor(locale);

  useEffect(() => {
    let active = true;
    async function loadFirstPage(): Promise<void> {
      setLoading(true);
      setError(undefined);
      setLoadFailed(false);
      // Drop the previous category's posts so they don't linger while the
      // new category loads or after it fails.
      setPosts([]);
      setCursor(null);
      try {
        const page = await getCommunityPage(category);
        if (active) {
          setPosts(page.items);
          setCursor(page.nextCursor);
        }
      } catch {
        if (active) setLoadFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadFirstPage();
    return () => {
      active = false;
    };
  }, [category, reloadKey]);

  async function loadMore(): Promise<void> {
    if (cursor === null) return;
    setLoading(true);
    setError(undefined);
    try {
      const page = await getCommunityPage(category, cursor);
      setPosts((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
    } catch (loadError: unknown) {
      setError(actionableErrorMessage(loadError, copy.loadMoreFailed));
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
      setError(actionableErrorMessage(submitError, copy.submitFailed));
    } finally {
      setPending(false);
    }
  }

  const composeLabel = composerOpen ? copy.composeClose : copy.compose;

  return (
    <Page>
      <PageHeader
        title={t.community.title}
        description={copy.description}
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
        <Card className={styles.composerCard} aria-label={copy.composerLabel}>
          <form
            className={styles.form}
            method="post"
            onSubmit={(event) => void submit(event)}
          >
            <div className={styles.formHead}>
              <strong>{copy.formHeading}</strong>
              <span>{copy.formPrivacy}</span>
            </div>
            <div className={styles.formRow}>
              <label className={styles.field}>
                <span>{copy.category}</span>
                <select name="category" defaultValue="TRAVEL_TIP">
                  {communityCategories.map((item) => (
                    <option key={item} value={item}>
                      {categoryLabels[item]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>
                  {copy.area} <small>{copy.areaOptional}</small>
                </span>
                <input
                  name="areaText"
                  maxLength={60}
                  placeholder={copy.areaPlaceholder}
                />
              </label>
            </div>
            <label className={styles.field}>
              <span>{copy.postTitle}</span>
              <input name="title" minLength={5} maxLength={100} required />
            </label>
            <label className={styles.field}>
              <span>{copy.content}</span>
              <textarea
                name="content"
                minLength={10}
                maxLength={2000}
                rows={6}
                required
              />
            </label>
            <Button type="submit" size="lg" block disabled={pending}>
              {pending ? copy.submitting : copy.submit}
            </Button>
          </form>
        </Card>
      )}

      <div
        className={`${uiStyles.filters} ${styles.filters}`}
        aria-label={copy.filtersLabel}
      >
        <button
          type="button"
          aria-pressed={category === undefined}
          onClick={() => setCategory(undefined)}
        >
          {copy.all}
        </button>
        {communityCategories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {categoryLabels[item]}
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
      {loading && posts.length === 0 ? (
        <Card padding="none" className={styles.feed} aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className={styles.skeleton} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          ))}
        </Card>
      ) : loadFailed && posts.length === 0 ? (
        <Card className={styles.feed}>
          <div role="alert">
            <EmptyState
              icon="alert"
              title={copy.loadFailedTitle}
              description={t.community.loadFailedDescription}
              action={
                <Button
                  variant="secondary"
                  icon="refresh"
                  onClick={() => setReloadKey((key) => key + 1)}
                >
                  {t.community.reload}
                </Button>
              }
            />
          </div>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <EmptyState
            icon="community"
            tone="iris"
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
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
                  <span>
                    {formatRelativeTime(post.createdAt, undefined, locale)}
                  </span>
                </span>
                <h2 className={styles.title}>
                  {post.removed ? t.community.hidden.postTitle : post.title}
                </h2>
                <p className={styles.preview}>
                  {post.removed ? t.community.hidden.post : post.content}
                </p>
              </Link>
              <footer className={styles.foot}>
                <Chip tone="plum">{categoryLabels[post.category]}</Chip>
                {post.areaText !== null && (
                  <Chip icon="pin">{post.areaText}</Chip>
                )}
                <span className={styles.comments}>
                  <AppIcon name="community" />
                  <span className="srOnly">{copy.comments}</span>
                  {post.commentCount}
                </span>
                {post.author.id !== currentUserId && !post.removed && (
                  <span className={styles.report}>
                    <ReportMenu
                      targets={[
                        {
                          type: 'COMMUNITY_POST',
                          id: post.id,
                          label: t.community.reportPost,
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
          {loading ? copy.loadingMore : copy.loadMore}
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
          {copy.compose}
        </Button>
      )}
    </Page>
  );
}
