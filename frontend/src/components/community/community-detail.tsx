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
import { communityCategoryLabels } from '@/lib/community/presentation';
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
      setCommentError(
        actionableErrorMessage(submitError, '댓글을 올리지 못했어요.'),
      );
    } finally {
      setPending(false);
    }
  }

  if (post === undefined) {
    return (
      <Page>
        <PageHeader
          title="커뮤니티"
          backHref="/app/community"
          backLabel="여행자 커뮤니티"
        />
        <div className={styles.detail}>
          <Card>
            {loadError === 'not-found' ? (
              <div role="status">
                <EmptyState
                  icon="search"
                  title="글을 찾을 수 없어요"
                  description="삭제됐거나 주소가 잘못됐을 수 있어요."
                  action={
                    <ButtonLink variant="secondary" href="/app/community">
                      커뮤니티 목록으로
                    </ButtonLink>
                  }
                />
              </div>
            ) : loadError === 'failed' ? (
              <div role="alert">
                <EmptyState
                  icon="alert"
                  title="게시글을 불러오지 못했어요"
                  description="연결을 확인한 뒤 다시 시도해 주세요."
                  action={
                    <Button
                      variant="secondary"
                      icon="refresh"
                      disabled={retrying}
                      onClick={retry}
                    >
                      {retrying ? '불러오는 중…' : '다시 불러오기'}
                    </Button>
                  }
                />
              </div>
            ) : (
              <p className={styles.removed} role="status">
                게시글을 불러오는 중…
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
        title="커뮤니티"
        backHref="/app/community"
        backLabel="여행자 커뮤니티"
      />
      <div className={styles.detail}>
        <Card as="article" className={styles.article}>
          <div className={styles.articleMeta}>
            <Chip tone="plum">{communityCategoryLabels[post.category]}</Chip>
            {post.areaText !== null && <Chip icon="pin">{post.areaText}</Chip>}
          </div>
          <h1>{post.title}</h1>
          <p
            className={`${styles.articleBody}${post.removed ? ` ${styles.removed}` : ''}`}
          >
            {post.content}
          </p>
          <footer className={styles.articleFoot}>
            <span className={styles.by}>
              <Avatar name={post.author.nickname} size="sm" tone="iris" />
              <b>{post.author.nickname}</b>
              <span>{formatRelativeTime(post.createdAt)}</span>
            </span>
            {post.author.id !== currentUserId && !post.removed && (
              <ReportMenu
                targets={[
                  { type: 'COMMUNITY_POST', id: post.id, label: '이 게시글' },
                  {
                    type: 'USER',
                    id: post.author.id,
                    label: `${post.author.nickname} 사용자`,
                  },
                ]}
              />
            )}
          </footer>
        </Card>

        <Card aria-labelledby="community-comments-title">
          <SectionHead
            id="community-comments-title"
            title={`댓글 ${post.comments.length}`}
          />
          {post.comments.length === 0 ? (
            <p className={styles.removed}>
              아직 댓글이 없어요. 알고 있는 정보를 보태 주세요.
            </p>
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
                                label: '이 댓글',
                              },
                              {
                                type: 'USER',
                                id: comment.author.id,
                                label: `${comment.author.nickname} 사용자`,
                              },
                            ]}
                          />
                        </span>
                      )}
                  </span>
                  <p className={comment.removed ? styles.removed : undefined}>
                    {comment.content}
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
                <span>댓글로 경험을 보태세요</span>
              </label>
              <div className={styles.field}>
                <textarea
                  id="community-comment"
                  name="content"
                  maxLength={500}
                  rows={3}
                  required
                  placeholder="질문에 답하거나 최신 정보를 덧붙여 주세요."
                />
              </div>
              <Button type="submit" disabled={pending}>
                {pending ? '올리는 중…' : '댓글 올리기'}
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
