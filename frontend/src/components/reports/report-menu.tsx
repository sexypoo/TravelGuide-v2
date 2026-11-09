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
import { useMessages } from '@/i18n/client';
import styles from './report-menu.module.css';

const focusableSelector =
  'button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

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
  const t = useMessages().chat.report;
  const [open, setOpen] = useState(false);
  const [targetIndex, setTargetIndex] = useState(0);
  const [reason, setReason] = useState<ReportReason>('FALSE_INFORMATION');
  const [detail, setDetail] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [complete, setComplete] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (complete) confirmRef.current?.focus();
  }, [complete]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (targets.length === 0) return null;
  const target = targets[targetIndex] ?? targets[0]!;

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const trimmed = detail.trim();
    if (reason === 'OTHER' && trimmed.length < 10) {
      setMessage(t.otherTooShort);
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
      setMessage(actionableErrorMessage(error, t.submitFailed));
    } finally {
      setPending(false);
    }
  }

  function trapFocus(event: React.KeyboardEvent<HTMLDivElement>): void {
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(focusableSelector),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
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
        aria-label={t.dialogLabel}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close();
          else if (event.key === 'Tab') trapFocus(event);
        }}
      >
        <IconButton
          ref={closeRef}
          className={styles.close}
          icon="close"
          label={t.closeLabel}
          onClick={close}
        />
        {complete ? (
          <div className={styles.complete} role="status">
            <IconTile icon="check" tone="iris" />
            <strong>{t.completeTitle}</strong>
            <p>{t.completeBody}</p>
            <Button ref={confirmRef} block onClick={close}>
              {t.confirm}
            </Button>
          </div>
        ) : (
          <form
            method="post"
            className={styles.form}
            onSubmit={(event) => void submit(event)}
          >
            <header className={styles.header}>
              <h2>{t.title}</h2>
              <p>{t.description}</p>
            </header>
            {targets.length > 1 && (
              <label className={styles.field}>
                <span>{t.target}</span>
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
              <span>{t.reason}</span>
              <select
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value as ReportReason)
                }
              >
                {reportReasons.map((item) => (
                  <option key={item} value={item}>
                    {t.reasons[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>
                {t.detail}{' '}
                <small>{reason === 'OTHER' ? t.required : t.optional}</small>
              </span>
              <textarea
                rows={4}
                maxLength={300}
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                placeholder={t.detailPlaceholder}
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
              {pending ? t.submitting : t.submit}
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
        {t.trigger}
      </button>
      {open && createPortal(sheet, document.body)}
    </div>
  );
}
