import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AdminMetricsResponse } from './dto/admin-metrics.response';
import { AdminMetricsService } from './admin-metrics.service';

@Controller('admin/metrics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminMetricsController {
  constructor(private readonly metrics: AdminMetricsService) {}

  @Get()
  get(): Promise<AdminMetricsResponse> {
    return this.metrics.get();
  }
}
