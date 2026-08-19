import { HttpStatus } from '@nestjs/common';
import { ProblemException } from '../common/http/problem.exception';

export function questionNotFoundProblem(): ProblemException {
  return new ProblemException(
    'QUESTION_NOT_FOUND',
    '질문을 찾을 수 없습니다.',
    HttpStatus.NOT_FOUND,
  );
}
