import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Environment } from '../config/environment';
import { QuestionsService } from './questions.service';

const EXPIRY_INTERVAL_MS = 60_000;

@Injectable()
export class QuestionExpiryService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(QuestionExpiryService.name);
  private timer: NodeJS.Timeout | undefined;

  constructor(
    private readonly questions: QuestionsService,
    private readonly config: ConfigService<Environment, true>,
  ) {}

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
      const count = await this.questions.expireDue();
      if (count > 0) this.logger.log(`Expired ${count} due topic(s)`);
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error(`Topic expiry batch failed: ${name}`);
    }
  }
}
