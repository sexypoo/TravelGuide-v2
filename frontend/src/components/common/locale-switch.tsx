'use client';

import { useState } from 'react';
import { useLocale, useMessages, writeLocaleCookie } from '@/i18n/client';
import styles from './locale-switch.module.css';

/**
 * Switches between Korean and English (#80). A full reload re-renders server
 * components and lets the API see the new cookie.
 */
export function LocaleSwitch({
  className,
}: {
  className?: string;
}): React.JSX.Element {
  const locale = useLocale();
  const t = useMessages();
  const [pending, setPending] = useState(false);
  const next = locale === 'ko' ? 'en' : 'ko';

  return (
    <button
      type="button"
      className={`${styles.switch}${className === undefined ? '' : ` ${className}`}`}
      lang={next}
      aria-label={t.common.languageSwitchLabel}
      disabled={pending}
      onClick={() => {
        setPending(true);
        writeLocaleCookie(next);
        window.location.reload();
      }}
    >
      {t.common.languageSwitch}
    </button>
  );
}
