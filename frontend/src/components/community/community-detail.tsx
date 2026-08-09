'use client';

import Link from 'next/link';
import { AppIcon } from '@/components/common';
import { useCallback, useEffect, useState } from 'react';
import { ReportMenu } from '@/components/reports/report-menu';
import { communityCategoryLabels } from './community-board';
import {
  createCommunityComment,
  getCommunityPost,
  type CommunityPostDetail,
} from '@/lib/api/community';
import { actionableErrorMessage } from '@/lib/api/problem-details';

export function CommunityDetail({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string;
}): React.JSX.Element {
  const [post, setPost] = useState<CommunityPostDetail>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setError(undefined);
    try {
      setPost(await getCommunityPost(postId));
    } catch (loadError: unknown) {
      setError(
        actionableErrorMessage(loadError, '게시글을 불러오지 못했습니다.'),
      );
    }
  }, [postId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const content = String(new FormData(form).get('content') ?? '').trim();
    if (content.length === 0) return;
    setPending(true);
    setError(undefined);
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
      setError(
        actionableErrorMessage(submitError, '댓글을 올리지 못했습니다.'),
      );
    } finally {
      setPending(false);
    }
  }

  if (post === undefined) {
    return (
      <div className="communityDetailPage">
        <Link href="/app/community">
          <AppIcon name="arrow-left" /> 커뮤니티
        </Link>
        <p role={error === undefined ? 'status' : 'alert'}>
          {error ?? '게시글을 불러오는 중…'}
        </p>
      </div>
    );
  }

  return (
    <div className="communityDetailPage">
      <Link className="appBackLink" href="/app/community">
        <AppIcon name="arrow-left" /> 여행자 커뮤니티
      </Link>
      <article className="communityDetailCard">
        <div className="communityCard__meta">
          <span>{communityCategoryLabels[post.category]}</span>
          {post.areaText !== null && (
            <mark>
              <AppIcon name="pin" /> {post.areaText}
            </mark>
          )}
        </div>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
        <footer>
          <span>{post.author.nickname}</span>
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
      </article>

      {!post.removed && (
        <form
          className="communityCommentForm"
          onSubmit={(event) => void submit(event)}
        >
          <label htmlFor="community-comment">댓글로 경험을 보태세요</label>
          <div>
            <textarea
              id="community-comment"
              name="content"
              maxLength={500}
              rows={3}
              required
              placeholder="질문에 답하거나 최신 정보를 덧붙여 주세요."
            />
            <button type="submit" disabled={pending}>
              {pending ? '올리는 중…' : '댓글 올리기'}
            </button>
          </div>
        </form>
      )}
      {error !== undefined && (
        <p className="communityError" role="alert">
          {error}
        </p>
      )}

      <section
        className="communityComments"
        aria-labelledby="community-comments-title"
      >
        <header>
          <h2 id="community-comments-title">댓글 {post.comments.length}</h2>
        </header>
        {post.comments.length === 0 ? (
          <p>아직 댓글이 없어요. 알고 있는 정보를 보태 주세요.</p>
        ) : (
          post.comments.map((comment) => (
            <article key={comment.id}>
              <strong>{comment.author.nickname}</strong>
              <p>{comment.content}</p>
              {comment.author.id !== currentUserId && !comment.removed && (
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
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
