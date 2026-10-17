import type { ReactNode } from 'react';
import { AppIcon, type AppIconName } from '@/components/common';
import { Button, Card, IconTile, Notice } from '@/components/ui';
import styles from './verification.module.css';

export function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <Card className={styles.formCard}>
      <header className={styles.formHead}>
        <h2>{title}</h2>
        {description !== undefined && <p>{description}</p>}
      </header>
      {children}
    </Card>
  );
}

export function PrepareCard({
  items,
}: {
  items: ReadonlyArray<{ icon: AppIconName; title: string; text: string }>;
}): React.JSX.Element {
  return (
    <Card className={styles.formCard} aria-label="신청 전에 준비할 것">
      <ul className={styles.prepare}>
        {items.map((item) => (
          <li key={item.title}>
            <IconTile icon={item.icon} tone="iris" />
            <span>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ProofPicker({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | undefined;
  onChange: (file: File | undefined) => void;
}): React.JSX.Element {
  return (
    <label
      className={styles.upload}
      data-selected={file === undefined ? undefined : 'true'}
    >
      <span className={styles.uploadIcon} aria-hidden="true">
        <AppIcon name={file === undefined ? 'image' : 'check'} />
      </span>
      <span className={styles.uploadText}>
        <strong>{label}</strong>
        <small>{file?.name ?? 'JPEG, PNG, PDF 파일, 최대 5MB'}</small>
      </span>
      <span className={styles.uploadAction} aria-hidden="true">
        {file === undefined ? '파일 고르기' : '바꾸기'}
      </span>
      <input
        className="srOnly"
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={(e) => onChange(e.target.files?.[0])}
      />
    </label>
  );
}

export function ConsentCard({
  checked,
  onChange,
  title,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <Card className={styles.formCard}>
      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>
          <strong>{title}</strong> {children}
        </span>
      </label>
    </Card>
  );
}

export function FormFooter({
  error,
  pending,
  label,
}: {
  error: string | undefined;
  pending: boolean;
  label: string;
}): React.JSX.Element {
  return (
    <div className={styles.footer}>
      {error !== undefined && (
        <Notice tone="danger" icon="alert" role="alert">
          {error}
        </Notice>
      )}
      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? (
          <>
            <span className={styles.spinner} aria-hidden="true" /> 신청 보내는
            중
          </>
        ) : (
          label
        )}
      </Button>
    </div>
  );
}
