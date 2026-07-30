import { HttpException, HttpStatus } from '@nestjs/common';

export interface ProblemDetails {
  type: 'about:blank';
  title: string;
  status: number;
  code: string;
  detail: string;
  requestId: string;
}

export class ProblemException extends HttpException {
  constructor(
    readonly code: string,
    readonly detail: string,
    status: HttpStatus,
  ) {
    super(detail, status);
  }
}
