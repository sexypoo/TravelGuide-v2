import { en } from './en';
import { ko } from './ko';

const HANGUL = /[가-힣]/u;
// Words that stay Korean on purpose in English copy.
const ALLOWED_KOREAN = new Set(['한국어']);

function walk(
  value: unknown,
  path: string,
  visit: (path: string, text: string) => void,
): void {
  if (typeof value === 'string') {
    visit(path, value);
  } else if (typeof value === 'function') {
    const sample = (value as (...args: unknown[]) => unknown)(
      'Busan',
      3,
      'Busan',
    );
    if (typeof sample === 'string') visit(`${path}()`, sample);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`, visit));
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      walk(child, path === '' ? key : `${path}.${key}`, visit);
    }
  }
}

function keys(value: unknown, path = ''): string[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return [path];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, path === '' ? key : `${path}.${key}`),
  );
}

describe('message dictionaries', () => {
  it('give English every key Korean has', () => {
    expect(keys(en).sort()).toEqual(keys(ko).sort());
  });

  it('leave no Korean text in English copy', () => {
    const untranslated: string[] = [];
    walk(en, '', (path, text) => {
      if (HANGUL.test(text) && !ALLOWED_KOREAN.has(text))
        untranslated.push(path);
    });
    expect(untranslated).toEqual([]);
  });

  it('keep list lengths the same in both languages', () => {
    const lengths = (dictionary: unknown): Record<string, number> => {
      const result: Record<string, number> = {};
      walk(dictionary, '', (path) => {
        const match = /^(.*)\[\d+\]$/u.exec(path);
        if (match?.[1] !== undefined) {
          result[match[1]] = (result[match[1]] ?? 0) + 1;
        }
      });
      return result;
    };
    expect(lengths(en)).toEqual(lengths(ko));
  });
});
