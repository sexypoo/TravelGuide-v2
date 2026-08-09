import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RoomsModule } from '../rooms/rooms.module';
import { PlaceFavoritesController } from './place-favorites.controller';
import { PlaceFavoritesService } from './place-favorites.service';

@Module({
  imports: [PrismaModule, RoomsModule],
  controllers: [PlaceFavoritesController],
  providers: [PlaceFavoritesService],
})
export class PlaceFavoritesModule {}
