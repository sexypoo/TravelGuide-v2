import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ENGLISH_DETAILS, englishDetail } from './english-details';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return path.endsWith('.ts') && !path.endsWith('.spec.ts') ? [path] : [];
  });
}

/** Korean details thrown or declared in src/ (#80). */
function koreanDetails(): string[] {
  const found = new Set<string>();
  const patterns = [
    /ProblemException\(\s*'[A-Z_]+',\s*'([^']*[가-힣][^']*)'/gu,
    /message:\s*'([^']*[가-힣][^']*)'/gu,
    /return '([^']*[가-힣][^']*)';/gu,
  ];
  for (const file of sourceFiles(join(__dirname, '..', '..'))) {
    if (file.endsWith('english-details.ts')) continue;
    if (file.endsWith('validation-message.ts')) continue;
    const source = readFileSync(file, 'utf8');
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        if (match[1] !== undefined) found.add(match[1]);
      }
    }
  }
  return [...found];
}

describe('English API details', () => {
  it('cover every Korean error message in the source', () => {
    const missing = koreanDetails().filter(
      (detail) =>
        ENGLISH_DETAILS[detail] === undefined &&
        !detail.includes('장소를 공유했습니다'),
    );
    expect(missing).toEqual([]);
  });

  it('contain no Korean in the English text', () => {
    for (const english of Object.values(ENGLISH_DETAILS)) {
      expect(english).not.toMatch(/[가-힣]/u);
    }
  });

  it('translate rate limits and fall back by status', () => {
    expect(
      englishDetail('요청이 너무 많습니다. 42초 후 다시 시도해 주세요.', 429),
    ).toBe('Too many requests. Please try again in 42 seconds.');
    expect(englishDetail('알 수 없는 오류입니다.', 404)).toBe(
      "We couldn't find what you were looking for.",
    );
    expect(englishDetail('Already English', 400)).toBe('Already English');
  });
});
