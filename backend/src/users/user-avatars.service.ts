import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import type { Readable } from 'node:stream';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import {
  STORAGE_SERVICE,
  type StorageService,
} from '../storage/storage.service';
import { type UserAvatarFile, validateUserAvatar } from './user-avatar-file';

export interface UserAvatarDownload {
  stream: Readable;
  mimeType: string;
  originalName: string;
}

@Injectable()
export class UserAvatarsService {
  private readonly logger = new Logger(UserAvatarsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async update(
    userId: string,
    file: UserAvatarFile | undefined,
  ): Promise<void> {
    validateUserAvatar(file);
    const previous = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarObjectKey: true },
    });
    if (previous === null) {
      throw new ProblemException(
        'USER_NOT_FOUND',
        '사용자를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    const objectKey = `profile-images/${userId}/${randomUUID()}`;
    await this.storage.putPrivate({ objectKey, contents: file.buffer });
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          avatarObjectKey: objectKey,
          avatarOriginalName: basename(file.originalname).slice(0, 255),
          avatarMimeType: file.mimetype,
          avatarSizeBytes: file.size,
        },
      });
    } catch (error: unknown) {
      await this.deleteStoredObject(objectKey);
      throw error;
    }

    if (previous.avatarObjectKey !== null) {
      await this.deleteStoredObject(previous.avatarObjectKey);
    }
  }

  async remove(userId: string): Promise<void> {
    const previous = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarObjectKey: true },
    });
    if (previous === null) {
      throw new ProblemException(
        'USER_NOT_FOUND',
        '사용자를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarObjectKey: null,
        avatarOriginalName: null,
        avatarMimeType: null,
        avatarSizeBytes: null,
      },
    });
    if (previous.avatarObjectKey !== null) {
      await this.deleteStoredObject(previous.avatarObjectKey);
    }
  }

  async get(userId: string): Promise<UserAvatarDownload> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatarObjectKey: true,
        avatarOriginalName: true,
        avatarMimeType: true,
      },
    });
    if (
      user?.avatarObjectKey == null ||
      user.avatarOriginalName == null ||
      user.avatarMimeType == null
    ) {
      throw new ProblemException(
        'PROFILE_IMAGE_NOT_FOUND',
        '프로필 사진을 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      stream: await this.storage.getPrivateDownload(
        user.avatarObjectKey,
        5 * 60,
      ),
      mimeType: user.avatarMimeType,
      originalName: user.avatarOriginalName,
    };
  }

  private async deleteStoredObject(objectKey: string): Promise<void> {
    try {
      await this.storage.delete(objectKey);
    } catch {
      this.logger.warn('Failed to clean an old profile image');
    }
  }
}
