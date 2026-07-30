import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  toOwnProfileResponse,
  toPublicProfileResponse,
  type OwnProfileResponse,
  type PublicProfileResponse,
} from './dto/profile.response';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OwnProfileResponse> {
    return toOwnProfileResponse(await this.users.getOwnProfile(currentUser.id));
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() input: UpdateProfileDto,
  ): Promise<OwnProfileResponse> {
    return toOwnProfileResponse(
      await this.users.updateProfile(currentUser.id, input),
    );
  }

  @Get(':userId/public')
  async publicProfile(
    @Param('userId') userId: string,
  ): Promise<PublicProfileResponse> {
    return toPublicProfileResponse(await this.users.getPublicProfile(userId));
  }
}
