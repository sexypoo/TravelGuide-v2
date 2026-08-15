import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PreordersController } from './preorders.controller';
import { PreordersService } from './preorders.service';

@Module({
  imports: [PrismaModule],
  controllers: [PreordersController],
  providers: [PreordersService],
})
export class PreordersModule {}
