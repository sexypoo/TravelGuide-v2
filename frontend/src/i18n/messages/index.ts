import type { Locale } from '../config';
import { en } from './en';
import { ko } from './ko';
import type { Messages } from './types';

export type { Messages } from './types';

export function messagesFor(locale: Locale): Messages {
  return locale === 'en' ? en : ko;
}
