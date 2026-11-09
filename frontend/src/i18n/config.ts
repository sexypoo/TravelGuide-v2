// Languages the web app speaks (#80, ADR-054). The choice lives in a cookie
// so the API can answer in the same language.

export const LOCALES = ['ko', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ko';
export const LOCALE_COOKIE = 'locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
  );
}

/** Korean unless the browser prefers English over Korean. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (header === null) return DEFAULT_LOCALE;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params
        .map((param) => param.trim())
        .find((param) => param.startsWith('q='));
      return {
        language: tag.toLowerCase().split('-')[0] ?? '',
        quality: q === undefined ? 1 : Number(q.slice(2)) || 0,
      };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);
  for (const entry of ranked) {
    if (entry.language === 'ko') return 'ko';
    if (entry.language === 'en') return 'en';
  }
  return DEFAULT_LOCALE;
}
