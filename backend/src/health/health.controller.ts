import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';

export interface LiveHealthResponse {
  status: 'ok';
  timestamp: string;
}

export interface ReadyHealthResponse extends LiveHealthResponse {
  database: 'up';
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  getLive(): LiveHealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async getReady(): Promise<ReadyHealthResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ProblemException(
        'DATABASE_UNAVAILABLE',
        '데이터베이스 연결을 확인할 수 없습니다.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return {
      status: 'ok',
      database: 'up',
      timestamp: new Date().toISOString(),
    };
  }
}
