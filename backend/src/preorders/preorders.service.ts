import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePreorderDto } from './dto/create-preorder.dto';

@Injectable()
export class PreordersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: CreatePreorderDto): Promise<void> {
    try {
      await this.prisma.preorderRegistration.create({
        data: {
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          consentedAt: new Date(),
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return;
      }
      throw error;
    }
  }
}
