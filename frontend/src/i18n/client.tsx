'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from './config';
import { messagesFor, type Messages } from './messages';

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function writeLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

function hasLocaleCookie(): boolean {
  return document.cookie
    .split(';')
    .some((part) => part.trim().startsWith(`${LOCALE_COOKIE}=`));
}

/**
 * Gives client components the server-chosen locale. On a first visit it also
 * saves that choice so the API answers in the same language.
 */
export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}): React.JSX.Element {
  useEffect(() => {
    if (!hasLocaleCookie()) writeLocaleCookie(locale);
  }, [locale]);
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useMessages(): Messages {
  return messagesFor(useContext(LocaleContext));
}
