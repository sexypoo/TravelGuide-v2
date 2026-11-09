import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from './config';
import { messagesFor, type Messages } from './messages';

/**
 * Locale for plain functions outside React (error helpers): the saved cookie
 * in the browser, Korean on the server.
 */
export function currentLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const saved = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`))
    ?.slice(LOCALE_COOKIE.length + 1);
  return isLocale(saved) ? saved : DEFAULT_LOCALE;
}

export function currentMessages(): Messages {
  return messagesFor(currentLocale());
}
