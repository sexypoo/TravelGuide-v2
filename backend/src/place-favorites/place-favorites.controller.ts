import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type {
  PlaceFavoriteListResponse,
  PlaceFavoriteResponse,
  RemovePlaceFavoriteResponse,
} from './dto/place-favorite.response';
import { SavePlaceFavoriteDto } from './dto/save-place-favorite.dto';
import { PlaceFavoritesService } from './place-favorites.service';

@Controller('place-favorites')
@UseGuards(JwtAuthGuard)
export class PlaceFavoritesController {
  constructor(private readonly favorites: PlaceFavoritesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PlaceFavoriteListResponse> {
    return this.favorites.list(user);
  }

  @Post()
  save(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: SavePlaceFavoriteDto,
  ): Promise<PlaceFavoriteResponse> {
    return this.favorites.save(user, input.messageId);
  }

  @Post(':favoriteId/remove')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('favoriteId') favoriteId: string,
  ): Promise<RemovePlaceFavoriteResponse> {
    return this.favorites.remove(user, favoriteId);
  }
}
