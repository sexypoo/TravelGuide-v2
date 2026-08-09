import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SaveTravelRecordDto } from './dto/save-travel-record.dto';
import {
  toTravelRecordResponse,
  type TravelRecordResponse,
} from './dto/travel-record.response';
import { TravelRecordsService } from './travel-records.service';

@Controller('travel-records')
@UseGuards(JwtAuthGuard)
export class TravelRecordsController {
  constructor(private readonly records: TravelRecordsService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ items: TravelRecordResponse[] }> {
    return {
      items: (await this.records.list(user.id)).map(toTravelRecordResponse),
    };
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: SaveTravelRecordDto,
  ): Promise<TravelRecordResponse> {
    return toTravelRecordResponse(await this.records.create(user.id, input));
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() input: SaveTravelRecordDto,
  ): Promise<TravelRecordResponse> {
    return toTravelRecordResponse(
      await this.records.update(user.id, id, input),
    );
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ deleted: true }> {
    await this.records.remove(user.id, id);
    return { deleted: true };
  }
}
