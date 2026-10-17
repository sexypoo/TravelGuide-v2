'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, IconButton, IconTile } from '@/components/ui';
import { actionableErrorMessage } from '@/lib/api/problem-details';
import {
  createReport,
  reportReasons,
  type ReportReason,
  type ReportTargetType,
} from '@/lib/api/reports';
import { reportReasonLabels } from './report-reason-labels';
import styles from './report-menu.module.css';

const reasonLabels = reportReasonLabels;

export interface ReportTargetOption {
  type: ReportTargetType;
  id: string;
  label: string;
}

export function ReportMenu({
  targets,
}: {
  targets: ReportTargetOption[];
}): React.JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [targetIndex, setTargetIndex] = useState(0);
  const [reason, setReason] = useState<ReportReason>('FALSE_INFORMATION');
  const [detail, setDetail] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [complete, setComplete] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (targets.length === 0) return null;
  const target = targets[targetIndex] ?? targets[0]!;

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const trimmed = detail.trim();
    if (reason === 'OTHER' && trimmed.length < 10) {
      setMessage('기타 사유는 10자 이상 입력해 주세요.');
      return;
    }
    setPending(true);
    setMessage(undefined);
    try {
      await createReport({
        targetType: target.type,
        targetId: target.id,
        reason,
        ...(trimmed.length === 0 ? {} : { detail: trimmed }),
      });
      setComplete(true);
    } catch (error: unknown) {
      setMessage(
        actionableErrorMessage(
          error,
          '신고를 접수하지 못했습니다. 연결을 확인해 주세요.',
        ),
      );
    } finally {
      setPending(false);
    }
  }

  function close(): void {
    setOpen(false);
    setMessage(undefined);
    setComplete(false);
    setDetail('');
    triggerRef.current?.focus();
  }

  const sheet = (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="신고하기"
        onKeyDown={(event) => {
          if (event.key === 'Escape') close();
        }}
      >
        <IconButton
          ref={closeRef}
          className={styles.close}
          icon="close"
          label="신고 창 닫기"
          onClick={close}
        />
        {complete ? (
          <div className={styles.complete} role="status">
            <IconTile icon="check" tone="iris" />
            <strong>신고가 접수됐어요</strong>
            <p>운영자가 내용을 확인하기 전까지 자동으로 숨기지 않습니다.</p>
            <Button block onClick={close}>
              확인
            </Button>
          </div>
        ) : (
          <form
            className={styles.form}
            onSubmit={(event) => void submit(event)}
          >
            <header className={styles.header}>
              <h2>신고하기</h2>
              <p>정확한 대상을 선택하면 운영자가 더 빠르게 확인할 수 있어요.</p>
            </header>
            {targets.length > 1 && (
              <label className={styles.field}>
                <span>신고 대상</span>
                <select
                  value={targetIndex}
                  onChange={(event) =>
                    setTargetIndex(Number(event.target.value))
                  }
                >
                  {targets.map((item, index) => (
                    <option key={`${item.type}-${item.id}`} value={index}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className={styles.field}>
              <span>신고 사유</span>
              <select
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value as ReportReason)
                }
              >
                {reportReasons.map((item) => (
                  <option key={item} value={item}>
                    {reasonLabels[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>
                자세한 내용{' '}
                <small>{reason === 'OTHER' ? '필수' : '선택'}</small>
              </span>
              <textarea
                rows={4}
                maxLength={300}
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                placeholder="운영자가 확인할 상황을 적어 주세요."
                aria-invalid={message !== undefined}
                aria-describedby={
                  message === undefined ? undefined : 'report-error'
                }
              />
            </label>
            {message !== undefined && (
              <p id="report-error" className={styles.error} role="alert">
                {message}
              </p>
            )}
            <Button type="submit" size="lg" block disabled={pending}>
              {pending ? '접수 중…' : '신고 접수하기'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.menu}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        onClick={() => setOpen(true)}
      >
        신고
      </button>
      {open && createPortal(sheet, document.body)}
    </div>
  );
}
