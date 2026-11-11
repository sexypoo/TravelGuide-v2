import 'server-only';

import { cookies, headers } from 'next/headers';
import {
  isLocale,
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  type Locale,
} from './config';
import { messagesFor, type Messages } from './messages';

/** The saved choice, or the browser's preference on a first visit. */
export async function getLocale(): Promise<Locale> {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return localeFromAcceptLanguage((await headers()).get('accept-language'));
}

export async function getMessages(): Promise<Messages> {
  return messagesFor(await getLocale());
}
