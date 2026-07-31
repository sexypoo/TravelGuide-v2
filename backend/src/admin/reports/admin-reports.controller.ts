import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/authenticated-user';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminReportsService } from './admin-reports.service';
import { AdminReportQueryDto } from './dto/admin-report-query.dto';
import type { AdminReportResponse } from './dto/admin-report.response';
import { ReviewReportDto } from './dto/review-report.dto';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminReportsController {
  constructor(private readonly reports: AdminReportsService) {}

  @Get()
  list(@Query() query: AdminReportQueryDto): Promise<AdminReportResponse[]> {
    return this.reports.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<AdminReportResponse> {
    return this.reports.get(id);
  }

  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: ReviewReportDto,
  ): Promise<AdminReportResponse> {
    return this.reports.review(id, user.id, input);
  }
}
