import {
  actionableErrorMessage,
  ApiProblem,
  type ProblemDetails,
} from './problem-details';

function problem(overrides: Partial<ProblemDetails> = {}): ApiProblem {
  return new ApiProblem({
    type: 'about:blank',
    title: 'Request failed',
    status: 400,
    code: 'BAD_REQUEST',
    detail: '입력 내용을 확인해 주세요.',
    requestId: 'req-1',
    ...overrides,
  });
}

describe('actionableErrorMessage', () => {
  it('preserves the retry guidance returned for rate limiting', () => {
    expect(
      actionableErrorMessage(
        problem({
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          detail: '요청이 너무 많습니다. 42초 후 다시 시도해 주세요.',
        }),
        'fallback',
      ),
    ).toBe('요청이 너무 많습니다. 42초 후 다시 시도해 주세요.');
  });

  it('turns authentication and server failures into recovery guidance', () => {
    expect(
      actionableErrorMessage(problem({ status: 401 }), 'fallback'),
    ).toContain('다시 로그인');
    expect(
      actionableErrorMessage(problem({ status: 503 }), 'fallback'),
    ).toContain('잠시 후 다시 시도');
  });

  it('uses the local fallback for connection failures', () => {
    expect(actionableErrorMessage(new TypeError('offline'), '연결 확인')).toBe(
      '연결 확인',
    );
  });
});
