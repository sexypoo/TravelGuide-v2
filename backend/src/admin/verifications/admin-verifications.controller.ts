import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import type { AuthenticatedUser } from '../../auth/authenticated-user';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminVerificationsService } from './admin-verifications.service';
import { AdminVerificationQueryDto } from './dto/admin-verification-query.dto';
import type { AdminVerificationResponse } from './dto/admin-verification.response';
import { ReviewVerificationDto } from './dto/review-verification.dto';

@Controller('admin/verifications')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminVerificationsController {
  constructor(private readonly verifications: AdminVerificationsService) {}

  @Get()
  list(
    @Query() query: AdminVerificationQueryDto,
  ): Promise<AdminVerificationResponse[]> {
    return this.verifications.list(query);
  }

  @Get(':id/evidence')
  async evidence(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    const evidence = await this.verifications.getEvidence(id);
    response.setHeader('Content-Type', evidence.mimeType);
    response.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(evidence.originalName)}`,
    );
    response.setHeader('Cache-Control', 'private, no-store');
    await pipeline(createReadStream(evidence.path), response);
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<AdminVerificationResponse> {
    return this.verifications.get(id);
  }

  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: ReviewVerificationDto,
  ): Promise<AdminVerificationResponse> {
    return this.verifications.review(id, user.id, input);
  }
}
