import { isRecord } from './runtime';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  code: string;
  detail: string;
  requestId: string;
}

export function parseProblemDetails(
  value: unknown,
  fallbackStatus: number,
): ProblemDetails {
  if (
    isRecord(value) &&
    typeof value.type === 'string' &&
    typeof value.title === 'string' &&
    typeof value.status === 'number' &&
    typeof value.code === 'string' &&
    typeof value.detail === 'string' &&
    typeof value.requestId === 'string'
  ) {
    return {
      type: value.type,
      title: value.title,
      status: value.status,
      code: value.code,
      detail: value.detail,
      requestId: value.requestId,
    };
  }

  return {
    type: 'about:blank',
    title: 'Request failed',
    status: fallbackStatus,
    code: 'HTTP_ERROR',
    detail: '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    requestId: 'unknown',
  };
}

export class ApiProblem extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string;

  constructor(problem: ProblemDetails) {
    super(problem.detail);
    this.name = 'ApiProblem';
    this.status = problem.status;
    this.code = problem.code;
    this.requestId = problem.requestId;
  }
}

export function actionableErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!(error instanceof ApiProblem)) return fallback;
  if (error.code === 'RATE_LIMIT_EXCEEDED') return error.message;
  if (error.status === 401) {
    return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
  }
  if (error.status >= 500) {
    return '서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.';
  }
  return error.message;
}

export async function problemFromResponse(
  response: Response,
): Promise<ApiProblem> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return new ApiProblem(parseProblemDetails(body, response.status));
}
