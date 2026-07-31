import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLocalVerificationDto } from './dto/create-local-verification.dto';
import { CreateTravelerVerificationDto } from './dto/create-traveler-verification.dto';
import type { VerificationResponse } from './dto/verification.response';
import { type EvidenceFile, MAX_EVIDENCE_BYTES } from './evidence-file';
import { VerificationsService } from './verifications.service';

const proofUpload = FileInterceptor('proofFile', {
  limits: { fileSize: MAX_EVIDENCE_BYTES },
});

@Controller('verifications')
@UseGuards(JwtAuthGuard)
export class VerificationsController {
  constructor(private readonly verifications: VerificationsService) {}

  @Get('me')
  listMine(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VerificationResponse[]> {
    return this.verifications.listMine(user.id);
  }

  @Post('traveler')
  @UseInterceptors(proofUpload)
  createTraveler(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateTravelerVerificationDto,
    @UploadedFile() file: EvidenceFile | undefined,
  ): Promise<VerificationResponse> {
    return this.verifications.createTraveler(user.id, input, file);
  }

  @Post('local')
  @UseInterceptors(proofUpload)
  createLocal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateLocalVerificationDto,
    @UploadedFile() file: EvidenceFile | undefined,
  ): Promise<VerificationResponse> {
    return this.verifications.createLocal(user.id, input, file);
  }
}
