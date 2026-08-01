import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';
import { CommunityService } from './community.service';
import { CreateCommunityCommentDto } from './dto/create-community-comment.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import type {
  CommunityCommentResponse,
  CommunityPostDetailResponse,
  CommunityPostPageResponse,
  CommunityPostResponse,
} from './dto/community.response';
import { ListCommunityPostsDto } from './dto/list-community-posts.dto';

@Controller('community/posts')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly community: CommunityService) {}

  @Get()
  list(
    @Query() query: ListCommunityPostsDto,
  ): Promise<CommunityPostPageResponse> {
    return this.community.list(query);
  }

  @Post()
  @RateLimit('COMMUNITY_POST')
  @UseGuards(RateLimitGuard)
  createPost(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateCommunityPostDto,
  ): Promise<CommunityPostResponse> {
    return this.community.createPost(user, input);
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<CommunityPostDetailResponse> {
    return this.community.get(id);
  }

  @Post(':id/comments')
  @RateLimit('COMMUNITY_COMMENT')
  @UseGuards(RateLimitGuard)
  createComment(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateCommunityCommentDto,
  ): Promise<CommunityCommentResponse> {
    return this.community.createComment(id, user, input);
  }
}
