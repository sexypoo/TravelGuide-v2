import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { GooglePlaceListResponse } from './dto/place.response';
import { NearbyPlacesDto, SearchPlacesDto } from './dto/search-places.dto';
import { PlacesService } from './places.service';

@Controller('places')
@UseGuards(JwtAuthGuard)
export class PlacesController {
  constructor(private readonly places: PlacesService) {}

  @Get('search')
  search(@Query() query: SearchPlacesDto): Promise<GooglePlaceListResponse> {
    return this.places.search(query);
  }

  @Get('nearby-restaurants')
  nearby(@Query() query: NearbyPlacesDto): Promise<GooglePlaceListResponse> {
    return this.places.nearbyRestaurants(query);
  }
}
