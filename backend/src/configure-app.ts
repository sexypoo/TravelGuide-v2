import {
  HttpStatus,
  type INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ProblemDetailsFilter } from './common/http/problem-details.filter';
import { ProblemException } from './common/http/problem.exception';
import { requestIdMiddleware } from './common/http/request-id.middleware';

function firstValidationMessage(errors: ValidationError[]): string {
  for (const error of errors) {
    const constraintMessage = Object.values(error.constraints ?? {})[0];
    if (constraintMessage !== undefined) {
      return constraintMessage;
    }

    const childMessage = firstValidationMessage(error.children ?? []);
    if (childMessage !== '입력값을 확인해 주세요.') {
      return childMessage;
    }
  }

  return '입력값을 확인해 주세요.';
}

export function configureApp(app: INestApplication): void {
  app.use(requestIdMiddleware);
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.useGlobalFilters(new ProblemDetailsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors): ProblemException =>
        new ProblemException(
          'VALIDATION_FAILED',
          firstValidationMessage(errors),
          HttpStatus.BAD_REQUEST,
        ),
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
}
