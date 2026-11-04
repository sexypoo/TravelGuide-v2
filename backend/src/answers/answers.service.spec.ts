import { ProblemException } from '../common/http/problem.exception';
import { normalizeSourceUrl, toLockedQuestionRow } from './answers.service';

function problemCode(callback: () => unknown): string {
  try {
    callback();
  } catch (error: unknown) {
    if (error instanceof ProblemException) {
      return error.code;
    }
    throw error;
  }
  throw new Error('Expected ProblemException');
}

describe('answer source URL', () => {
  it('requires an official HTTPS URL', () => {
    expect(
      problemCode(() =>
        normalizeSourceUrl({
          content: '유효한 답변 내용입니다.',
          sourceType: 'OFFICIAL_SOURCE',
        }),
      ),
    ).toBe('SOURCE_URL_REQUIRED');
    expect(
      problemCode(() =>
        normalizeSourceUrl({
          content: '유효한 답변 내용입니다.',
          sourceType: 'OFFICIAL_SOURCE',
          sourceUrl: 'http://example.com/info',
        }),
      ),
    ).toBe('INVALID_SOURCE_URL');
  });

  it('normalizes a valid HTTPS source and keeps an omitted optional URL null', () => {
    expect(
      normalizeSourceUrl({
        content: '공식 출처가 있는 답변입니다.',
        sourceType: 'OFFICIAL_SOURCE',
        sourceUrl: 'https://example.com/notices/latest',
      }),
    ).toBe('https://example.com/notices/latest');
    expect(
      normalizeSourceUrl({
        content: '현장에서 직접 확인한 답변입니다.',
        sourceType: 'ON_SITE_NOW',
      }),
    ).toBeNull();
  });
});

describe('locked topic row', () => {
  const expiresAt = new Date('2026-08-01T02:00:00.000Z');

  it('keeps a raw Question row with a known status', () => {
    expect(
      toLockedQuestionRow({
        authorId: 'owner-id',
        status: 'RESOLVED',
        expiresAt,
        removedAt: null,
      }),
    ).toEqual({
      authorId: 'owner-id',
      status: 'RESOLVED',
      expiresAt,
      removedAt: null,
    });
  });

  it('rejects rows with unknown status or wrong column types', () => {
    expect(() =>
      toLockedQuestionRow({
        authorId: 'owner-id',
        status: 'CLOSED',
        expiresAt,
        removedAt: null,
      }),
    ).toThrow('Unexpected Question row shape');
    expect(() =>
      toLockedQuestionRow({
        authorId: 'owner-id',
        status: 'OPEN',
        expiresAt: expiresAt.toISOString(),
        removedAt: null,
      }),
    ).toThrow('Unexpected Question row shape');
    expect(() => toLockedQuestionRow(undefined)).toThrow(
      'Unexpected Question row shape',
    );
  });
});
