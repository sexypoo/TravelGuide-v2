import { isLocale, localeFromAcceptLanguage } from './config';

describe('locale config', () => {
  it('accepts only supported locales', () => {
    expect(isLocale('ko')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('picks the first of Korean or English the browser prefers', () => {
    expect(localeFromAcceptLanguage(null)).toBe('ko');
    expect(localeFromAcceptLanguage('en-US,en;q=0.9')).toBe('en');
    expect(localeFromAcceptLanguage('de-DE,de;q=0.9,en;q=0.8,ko;q=0.7')).toBe(
      'en',
    );
    expect(localeFromAcceptLanguage('de,ko;q=0.9,en;q=0.8')).toBe('ko');
    expect(localeFromAcceptLanguage('fr-FR')).toBe('ko');
    expect(localeFromAcceptLanguage('en;q=0,ko;q=0.5')).toBe('ko');
  });
});
