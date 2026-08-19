import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Environment } from '../config/environment';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisher } from '../realtime/realtime.publisher';
import { toQuestionResponse } from './dto/question.response';
import { expiringQuestionInclude } from './question-record';

const EXPIRY_INTERVAL_MS = 60_000;

@Injectable()
export class QuestionExpiryService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(QuestionExpiryService.name);
  private timer: NodeJS.Timeout | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly publisher: RealtimePublisher,
    private readonly config: ConfigService<Environment, true>,
  ) {}

  async expireDue(now = new Date()): Promise<number> {
    const candidates = await this.prisma.question.findMany({
      where: { status: 'OPEN', expiresAt: { lte: now } },
      select: { id: true },
      orderBy: [{ expiresAt: 'asc' }, { id: 'asc' }],
      take: 100,
    });
    let expiredCount = 0;
    for (const candidate of candidates) {
      const expired = await this.prisma.$transaction(async (transaction) => {
        const updated = await transaction.question.updateMany({
          where: {
            id: candidate.id,
            status: 'OPEN',
            expiresAt: { lte: now },
          },
          data: { status: 'EXPIRED' },
        });
        if (updated.count === 0) return null;
        return transaction.question.findUnique({
          where: { id: candidate.id },
          include: expiringQuestionInclude,
        });
      });
      if (expired === null) continue;
      expiredCount += 1;
      const response = toQuestionResponse(expired, now);
      try {
        this.publisher.publishQuestionUpdated(
          expired.room.id,
          expired.room.slug,
          response,
          now,
        );
      } catch (error: unknown) {
        const name = error instanceof Error ? error.name : 'UnknownError';
        this.logger.warn(`Question expiry publication failed: ${name}`);
      }
    }
    return expiredCount;
  }

  onApplicationBootstrap(): void {
    if (this.config.get('NODE_ENV', { infer: true }) === 'test') return;
    void this.run();
    this.timer = setInterval(() => void this.run(), EXPIRY_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer !== undefined) clearInterval(this.timer);
  }

  private async run(): Promise<void> {
    try {
      const count = await this.expireDue();
      if (count > 0) this.logger.log(`Expired ${count} due topic(s)`);
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error(`Topic expiry batch failed: ${name}`);
    }
  }
}
