import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProblemException, type ProblemDetails } from './problem.exception';

const titles: Readonly<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

const defaultCodes: Readonly<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'AUTHENTICATION_REQUIRED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
};

function getHttpDetail(exception: HttpException): string {
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return response;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'message' in response
  ) {
    const message: unknown = response.message;

    if (typeof message === 'string') {
      return message;
    }

    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === 'string')
    ) {
      return message.join(', ');
    }
  }

  return exception.message;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const requestId = request.requestId ?? 'unknown';

    if (!isHttpException) {
      const exceptionName =
        exception instanceof Error ? exception.name : 'UnknownException';
      this.logger.error(`Unhandled ${exceptionName} for request ${requestId}`);
    }

    const problem: ProblemDetails = {
      type: 'about:blank',
      title: titles[status] ?? 'Error',
      status,
      code:
        exception instanceof ProblemException
          ? exception.code
          : (defaultCodes[status] ?? 'HTTP_ERROR'),
      detail:
        status === 500
          ? '서버에서 요청을 처리하지 못했습니다.'
          : isHttpException
            ? getHttpDetail(exception)
            : '서버에서 요청을 처리하지 못했습니다.',
      requestId,
    };

    response.status(status).json(problem);
  }
}
