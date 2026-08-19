'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteOwnAccount } from '@/lib/api/profile';
import { actionableErrorMessage, ApiProblem } from '@/lib/api/problem-details';

interface AccountDeletionPanelProps {
  hasPassword: boolean;
}

const CONFIRMATION = '계정 삭제';

function deletionErrorMessage(error: unknown): string {
  if (
    error instanceof ApiProblem &&
    error.code === 'ACCOUNT_DELETION_REAUTH_FAILED'
  ) {
    return '현재 비밀번호가 맞지 않습니다.';
  }
  return actionableErrorMessage(
    error,
    '계정을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  );
}

export function AccountDeletionPanel({
  hasPassword,
}: AccountDeletionPanelProps): React.JSX.Element {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready =
    confirmation.trim() === CONFIRMATION &&
    (!hasPassword || password.length > 0) &&
    !submitting;

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteOwnAccount({
        confirmation: confirmation.trim(),
        ...(hasPassword ? { password } : {}),
      });
      router.replace('/account-deletion?deleted=true');
      router.refresh();
    } catch (caught: unknown) {
      setError(deletionErrorMessage(caught));
      setSubmitting(false);
    }
  }

  return (
    <section className="accountManagement" aria-labelledby="account-title">
      <header>
        <div>
          <p>ACCOUNT</p>
          <h2 id="account-title">계정 관리</h2>
          <span>개인정보 처리방침과 영구 삭제 경로를 확인할 수 있어요.</span>
        </div>
        <nav aria-label="계정 정책">
          <Link href="/privacy">개인정보 처리방침</Link>
          <Link href="/account-deletion">삭제 안내</Link>
        </nav>
      </header>

      {!expanded ? (
        <button
          className="accountManagement__open"
          type="button"
          onClick={() => setExpanded(true)}
        >
          계정 삭제 살펴보기
        </button>
      ) : (
        <form className="accountDeletion" onSubmit={submit}>
          <div className="accountDeletion__scope">
            <strong>삭제하면 되돌릴 수 없습니다.</strong>
            <p>
              프로필과 인증, 질문·답변·채팅·커뮤니티 콘텐츠, 여행 기록과 찜,
              비공개 증빙 및 업로드 파일이 함께 삭제됩니다.
            </p>
            <ol aria-label="계정 삭제 범위">
              <li>계정</li>
              <li>공개 콘텐츠</li>
              <li>비공개 증빙·업로드</li>
            </ol>
          </div>

          {hasPassword ? (
            <label>
              <span>현재 비밀번호</span>
              <input
                autoComplete="current-password"
                disabled={submitting}
                maxLength={72}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>
          ) : (
            <p className="accountDeletion__socialNotice">
              소셜 로그인으로 만든 계정입니다. 연결된 로그인 정보도 함께
              해제됩니다.
            </p>
          )}

          <label>
            <span>
              확인을 위해 <b>{CONFIRMATION}</b>를 입력해 주세요.
            </span>
            <input
              autoComplete="off"
              disabled={submitting}
              onChange={(event) => setConfirmation(event.target.value)}
              value={confirmation}
            />
          </label>

          {error === null ? null : (
            <p className="accountDeletion__error" role="alert">
              {error}
            </p>
          )}

          <div className="accountDeletion__actions">
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setExpanded(false);
                setConfirmation('');
                setPassword('');
                setError(null);
              }}
            >
              취소
            </button>
            <button type="submit" disabled={!ready}>
              {submitting ? '삭제 중…' : '계정 영구 삭제'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
