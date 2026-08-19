import {
  HttpStatus,
  type INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';
import cookieParser from 'cookie-parser';
import { ProblemDetailsFilter } from './common/http/problem-details.filter';
import { ProblemException } from './common/http/problem.exception';
import { requestIdMiddleware } from './common/http/request-id.middleware';
import { securityHeadersMiddleware } from './common/http/security-headers.middleware';
import { StructuredLogger } from './common/logging/structured-logger';
import type { Environment } from './config/environment';

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
  app.useLogger(new StructuredLogger(process.env.NODE_ENV !== 'test'));
  app.use(requestIdMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  const config = app.get(ConfigService<Environment, true>);
  const webOrigin = config.get('WEB_ORIGIN', { infer: true });
  const allowOrigin: CustomOrigin = (origin, callback): void => {
    callback(null, origin === undefined || origin === webOrigin);
  };
  app.enableCors({
    credentials: true,
    origin: allowOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Content-Type', 'X-Request-Id'],
  });
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
