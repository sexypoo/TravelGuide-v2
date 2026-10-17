import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { AppIcon, type AppIconName } from '@/components/common';
import styles from './ui.module.css';

function cx(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(' ');
}

export type Tone = 'iris' | 'magenta' | 'plum' | 'neutral';
export type ChipTone =
  | 'local'
  | 'traveler'
  | 'plum'
  | 'neutral'
  | 'success'
  | 'danger'
  | 'warning';

export function Card({
  children,
  padding = 'padded',
  className,
  as: Tag = 'section',
  ...rest
}: {
  children: ReactNode;
  padding?: 'padded' | 'list' | 'none';
  className?: string;
  as?: 'section' | 'div' | 'article' | 'aside';
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}): React.JSX.Element {
  return (
    <Tag
      className={cx(
        styles.card,
        padding === 'padded' && styles.cardPadded,
        padding === 'list' && styles.cardList,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SectionHead({
  title,
  id,
  action,
}: {
  title: string;
  id?: string;
  action?: ReactNode;
}): React.JSX.Element {
  return (
    <div className={styles.sectionHead}>
      <h2 id={id}>{title}</h2>
      {action}
    </div>
  );
}

export function IconTile({
  icon,
  tone = 'neutral',
}: {
  icon: AppIconName;
  tone?: Tone;
}): React.JSX.Element {
  return (
    <span
      className={cx(styles.tile, styles[`tile--${tone}`])}
      aria-hidden="true"
    >
      <AppIcon name={icon} />
    </span>
  );
}

export function ListRow({
  href,
  icon,
  tone,
  title,
  description,
  trailing,
  chevron = href !== undefined,
}: {
  href?: string;
  icon?: AppIconName;
  tone?: Tone;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
}): React.JSX.Element {
  const content = (
    <>
      {icon !== undefined && <IconTile icon={icon} tone={tone} />}
      <span className={styles.rowText}>
        <span className={styles.rowTitle}>{title}</span>
        {description !== undefined && (
          <span className={styles.rowDescription}>{description}</span>
        )}
      </span>
      {(trailing !== undefined || chevron) && (
        <span className={styles.rowTrailing}>
          {trailing}
          {chevron && <AppIcon name="chevron-right" />}
        </span>
      )}
    </>
  );
  return href === undefined ? (
    <div className={styles.row}>{content}</div>
  ) : (
    <Link className={styles.row} href={href}>
      {content}
    </Link>
  );
}

export function Chip({
  tone = 'neutral',
  icon,
  children,
}: {
  tone?: ChipTone;
  icon?: AppIconName;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <span className={cx(styles.chip, styles[`chip--${tone}`])}>
      {icon !== undefined && <AppIcon name={icon} />}
      {children}
    </span>
  );
}

export function Avatar({
  name,
  imageUrl,
  size = 'md',
  tone = 'iris',
}: {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'iris' | 'magenta' | 'plum';
}): React.JSX.Element {
  const initial = Array.from(name.trim())[0] ?? '여';
  return (
    <span
      className={cx(
        styles.avatar,
        styles[`avatar--${size}`],
        styles[`avatar--${tone}`],
      )}
      aria-hidden="true"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- private, signed avatar URLs
        <img src={imageUrl} alt="" />
      ) : (
        initial
      )}
    </span>
  );
}

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'light'
  | 'dark'
  | 'danger'
  | 'ghost'
  | 'live';

function buttonClass(
  variant: ButtonVariant,
  size: 'sm' | 'md' | 'lg',
  block: boolean,
  className?: string,
): string {
  return cx(
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    block && styles['button--block'],
    className,
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  icon?: AppIconName;
} & ComponentProps<'button'>): React.JSX.Element {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, block, className)}
      {...rest}
    >
      {icon !== undefined && <AppIcon name={icon} />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  className,
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  icon?: AppIconName;
} & ComponentProps<typeof Link>): React.JSX.Element {
  return (
    <Link className={buttonClass(variant, size, block, className)} {...rest}>
      {icon !== undefined && <AppIcon name={icon} />}
      {children}
    </Link>
  );
}

export function IconButton({
  icon,
  label,
  className,
  type = 'button',
  ...rest
}: {
  icon: AppIconName;
  label: string;
} & Omit<ComponentProps<'button'>, 'children'>): React.JSX.Element {
  return (
    <button
      type={type}
      className={cx(styles.iconButton, className)}
      aria-label={label}
      {...rest}
    >
      <AppIcon name={icon} />
    </button>
  );
}

export function IconLink({
  icon,
  label,
  className,
  ...rest
}: {
  icon: AppIconName;
  label: string;
} & Omit<ComponentProps<typeof Link>, 'children'>): React.JSX.Element {
  return (
    <Link
      className={cx(styles.iconButton, className)}
      aria-label={label}
      {...rest}
    >
      <AppIcon name={icon} />
    </Link>
  );
}

export function EmptyState({
  icon,
  tone = 'neutral',
  title,
  description,
  action,
}: {
  icon: AppIconName;
  tone?: Tone;
  title: string;
  description?: string;
  action?: ReactNode;
}): React.JSX.Element {
  return (
    <div className={styles.empty}>
      <IconTile icon={icon} tone={tone} />
      <h3>{title}</h3>
      {description !== undefined && <p>{description}</p>}
      {action}
    </div>
  );
}

export function Notice({
  tone = 'info',
  icon,
  children,
  role,
}: {
  tone?: 'info' | 'danger' | 'success' | 'warning';
  icon?: AppIconName;
  children: ReactNode;
  role?: 'status' | 'alert';
}): React.JSX.Element {
  return (
    <div className={cx(styles.notice, styles[`notice--${tone}`])} role={role}>
      {icon !== undefined && <AppIcon name={icon} />}
      <span>{children}</span>
    </div>
  );
}

export const uiStyles = styles;
