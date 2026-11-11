'use client';

import { Page, PageHeader } from '@/components/app/page';
import {
  Avatar,
  Button,
  ButtonLink,
  Card,
  Chip,
  EmptyState,
  Notice,
  SectionHead,
} from '@/components/ui';
import { formatRelativeTime } from '@/lib/questions/presentation';
import styles from './community.module.css';
import { useEffect, useState } from 'react';
import { ReportMenu } from '@/components/reports/report-menu';
import { communityCategoryLabelsFor } from '@/lib/community/presentation';
import { useLocale, useMessages } from '@/i18n/client';
import {
  createCommunityComment,
  getCommunityPost,
  type CommunityPostDetail,
} from '@/lib/api/community';
import { ApiProblem, actionableErrorMessage } from '@/lib/api/problem-details';

type LoadError = 'failed' | 'not-found';

function isNotFound(error: unknown): boolean {
  return (
    error instanceof ApiProblem &&
    (error.status === 404 || error.code === 'COMMUNITY_POST_NOT_FOUND')
  );
}

export function CommunityDetail({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string;
}): React.JSX.Element {
  const [post, setPost] = useState<CommunityPostDetail>();
  const [loadError, setLoadError] = useState<LoadError>();
  const [reloadKey, setReloadKey] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [commentError, setCommentError] = useState<string>();
  const [pending, setPending] = useState(false);
  const t = useMessages();
  const locale = useLocale();
  const copy = t.community.detail;

  useEffect(() => {
    let active = true;
    async function loadPost(): Promise<void> {
      try {
        const next = await getCommunityPost(postId);
        if (active) {
          setPost(next);
          setLoadError(undefined);
        }
      } catch (error: unknown) {
        if (active) setLoadError(isNotFound(error) ? 'not-found' : 'failed');
      } finally {
        if (active) setRetrying(false);
      }
    }
    void loadPost();
    return () => {
      active = false;
    };
  }, [postId, reloadKey]);

  function retry(): void {
    setRetrying(true);
    setReloadKey((key) => key + 1);
  }

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const content = String(new FormData(form).get('content') ?? '').trim();
    if (content.length === 0) return;
    setPending(true);
    setCommentError(undefined);
    try {
      const comment = await createCommunityComment(postId, content);
      setPost((current) =>
        current === undefined
          ? current
          : {
              ...current,
              comments: [...current.comments, comment],
              commentCount: current.commentCount + 1,
            },
      );
      form.reset();
    } catch (submitError: unknown) {
      setCommentError(actionableErrorMessage(submitError, copy.commentFailed));
    } finally {
      setPending(false);
    }
  }

  if (post === undefined) {
    return (
      <Page>
        <PageHeader
          title={t.community.title}
          backHref="/app/community"
          backLabel={copy.backLabel}
        />
        <div className={styles.detail}>
          <Card>
            {loadError === 'not-found' ? (
              <div role="status">
                <EmptyState
                  icon="search"
                  title={copy.notFoundTitle}
                  description={copy.notFoundDescription}
                  action={
                    <ButtonLink variant="secondary" href="/app/community">
                      {copy.backToList}
                    </ButtonLink>
                  }
                />
              </div>
            ) : loadError === 'failed' ? (
              <div role="alert">
                <EmptyState
                  icon="alert"
                  title={copy.loadFailedTitle}
                  description={t.community.loadFailedDescription}
                  action={
                    <Button
                      variant="secondary"
                      icon="refresh"
                      disabled={retrying}
                      onClick={retry}
                    >
                      {retrying ? copy.reloading : t.community.reload}
                    </Button>
                  }
                />
              </div>
            ) : (
              <p className={styles.removed} role="status">
                {copy.loading}
              </p>
            )}
          </Card>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title={t.community.title}
        backHref="/app/community"
        backLabel={copy.backLabel}
      />
      <div className={styles.detail}>
        <Card as="article" className={styles.article}>
          <div className={styles.articleMeta}>
            <Chip tone="plum">
              {communityCategoryLabelsFor(locale)[post.category]}
            </Chip>
            {post.areaText !== null && <Chip icon="pin">{post.areaText}</Chip>}
          </div>
          <h1>{post.removed ? t.community.hidden.postTitle : post.title}</h1>
          <p
            className={`${styles.articleBody}${post.removed ? ` ${styles.removed}` : ''}`}
          >
            {post.removed ? t.community.hidden.post : post.content}
          </p>
          <footer className={styles.articleFoot}>
            <span className={styles.by}>
              <Avatar name={post.author.nickname} size="sm" tone="iris" />
              <b>{post.author.nickname}</b>
              <span>
                {formatRelativeTime(post.createdAt, undefined, locale)}
              </span>
            </span>
            {post.author.id !== currentUserId && !post.removed && (
              <ReportMenu
                targets={[
                  {
                    type: 'COMMUNITY_POST',
                    id: post.id,
                    label: t.community.reportPost,
                  },
                  {
                    type: 'USER',
                    id: post.author.id,
                    label: copy.reportUser(post.author.nickname),
                  },
                ]}
              />
            )}
          </footer>
        </Card>

        <Card aria-labelledby="community-comments-title">
          <SectionHead
            id="community-comments-title"
            title={copy.commentsTitle(post.comments.length)}
          />
          {post.comments.length === 0 ? (
            <p className={styles.removed}>{copy.noComments}</p>
          ) : (
            <ul className={styles.commentList}>
              {post.comments.map((comment) => (
                <li key={comment.id} className={styles.comment}>
                  <span className={styles.by}>
                    <Avatar
                      name={comment.author.nickname}
                      size="sm"
                      tone="magenta"
                    />
                    <b>{comment.author.nickname}</b>
                    {comment.author.id !== currentUserId &&
                      !comment.removed && (
                        <span className={styles.report}>
                          <ReportMenu
                            targets={[
                              {
                                type: 'COMMUNITY_COMMENT',
                                id: comment.id,
                                label: copy.reportComment,
                              },
                              {
                                type: 'USER',
                                id: comment.author.id,
                                label: copy.reportUser(comment.author.nickname),
                              },
                            ]}
                          />
                        </span>
                      )}
                  </span>
                  <p className={comment.removed ? styles.removed : undefined}>
                    {comment.removed
                      ? t.community.hidden.comment
                      : comment.content}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {!post.removed && (
            <form
              className={`${styles.form} ${styles.commentForm}`}
              method="post"
              onSubmit={(event) => void submit(event)}
            >
              <label className={styles.field} htmlFor="community-comment">
                <span>{copy.commentLabel}</span>
              </label>
              <div className={styles.field}>
                <textarea
                  id="community-comment"
                  name="content"
                  maxLength={500}
                  rows={3}
                  required
                  placeholder={copy.commentPlaceholder}
                />
              </div>
              <Button type="submit" disabled={pending}>
                {pending ? copy.commentSubmitting : copy.commentSubmit}
              </Button>
            </form>
          )}
          {commentError !== undefined && (
            <Notice tone="danger" icon="alert" role="alert">
              {commentError}
            </Notice>
          )}
        </Card>
      </div>
    </Page>
  );
}
