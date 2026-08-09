import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { pipeline } from 'node:stream/promises';
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
import { MAX_USER_AVATAR_BYTES, type UserAvatarFile } from './user-avatar-file';
import { UserAvatarsService } from './user-avatars.service';
import { UsersService } from './users.service';

const avatarUpload = FileInterceptor('image', {
  limits: { fileSize: MAX_USER_AVATAR_BYTES },
});

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly avatars: UserAvatarsService,
  ) {}

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

  @Post('me/avatar')
  @UseInterceptors(avatarUpload)
  async updateAvatar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @UploadedFile() file: UserAvatarFile | undefined,
  ): Promise<OwnProfileResponse> {
    await this.avatars.update(currentUser.id, file);
    return toOwnProfileResponse(await this.users.getOwnProfile(currentUser.id));
  }

  @Delete('me/avatar')
  async removeAvatar(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OwnProfileResponse> {
    await this.avatars.remove(currentUser.id);
    return toOwnProfileResponse(await this.users.getOwnProfile(currentUser.id));
  }

  @Get(':userId/avatar')
  async avatar(
    @Param('userId') userId: string,
    @Res() response: Response,
  ): Promise<void> {
    const avatar = await this.avatars.get(userId);
    response.setHeader('Content-Type', avatar.mimeType);
    response.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(avatar.originalName)}`,
    );
    response.setHeader('Cache-Control', 'private, max-age=300');
    await pipeline(avatar.stream, response);
  }

  @Get(':userId/public')
  async publicProfile(
    @Param('userId') userId: string,
  ): Promise<PublicProfileResponse> {
    return toPublicProfileResponse(await this.users.getPublicProfile(userId));
  }
}
