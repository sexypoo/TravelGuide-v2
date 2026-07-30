import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RoomResponse } from './dto/room.response';
import { RoomsService } from './rooms.service';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<RoomResponse[]> {
    return this.rooms.list(user);
  }

  @Get(':slug/content-access')
  @HttpCode(HttpStatus.NO_CONTENT)
  async contentAccess(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.rooms.assertContentAccess(slug, user);
  }

  @Get(':slug')
  get(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RoomResponse> {
    return this.rooms.get(slug, user);
  }
}
