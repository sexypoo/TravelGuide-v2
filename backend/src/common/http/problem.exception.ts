import { HttpException, HttpStatus } from '@nestjs/common';
import type { ValidationIssue } from './validation-message';

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
    /** Set for input validation so the detail can be shown in English. */
    readonly validation?: ValidationIssue,
  ) {
    super(detail, status);
  }
}
