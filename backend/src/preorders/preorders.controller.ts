import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';
import { CreatePreorderDto } from './dto/create-preorder.dto';
import {
  toPreorderResponse,
  type PreorderResponse,
} from './dto/preorder.response';
import { PreordersService } from './preorders.service';

@Controller('preorders')
export class PreordersController {
  constructor(private readonly preorders: PreordersService) {}

  @Post()
  @RateLimit('PREORDER')
  @UseGuards(RateLimitGuard)
  async register(@Body() input: CreatePreorderDto): Promise<PreorderResponse> {
    await this.preorders.register(input);
    return toPreorderResponse();
  }
}
