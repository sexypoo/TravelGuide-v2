import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';
import { CreateReportDto } from './dto/create-report.dto';
import type { ReportResponse } from './dto/report.response';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  @RateLimit('REPORT')
  @UseGuards(RateLimitGuard)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateReportDto,
  ): Promise<ReportResponse> {
    return this.reports.create(user, input);
  }
}
