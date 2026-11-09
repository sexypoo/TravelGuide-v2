'use client';

import { AppIcon } from '@/components/common';
import { useMessages } from '@/i18n/client';

interface AppErrorProps {
  reset: () => void;
  title?: string;
}

export function AppError({ reset, title }: AppErrorProps): React.JSX.Element {
  const t = useMessages().home.error;
  return (
    <section className="appError" role="alert">
      <span aria-hidden="true">
        <AppIcon name="alert" />
      </span>
      <h1>{title ?? t.title}</h1>
      <p>{t.description}</p>
      <button type="button" onClick={reset}>
        {t.retry}
      </button>
    </section>
  );
}
