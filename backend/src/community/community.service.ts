import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import {
  decodeCommunityCursor,
  encodeCommunityCursor,
  type CommunityCursor,
} from './community-cursor';
import type { CreateCommunityCommentDto } from './dto/create-community-comment.dto';
import type { CreateCommunityPostDto } from './dto/create-community-post.dto';
import type {
  CommunityCommentResponse,
  CommunityPostDetailResponse,
  CommunityPostPageResponse,
  CommunityPostResponse,
} from './dto/community.response';
import type { ListCommunityPostsDto } from './dto/list-community-posts.dto';

const REMOVED_POST = '운영 정책에 따라 숨김 처리된 게시글입니다.';
const REMOVED_COMMENT = '운영 정책에 따라 숨김 처리된 댓글입니다.';
const postInclude = {
  author: { select: { id: true, nickname: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.CommunityPostInclude;

type PostRecord = Prisma.CommunityPostGetPayload<{
  include: typeof postInclude;
}>;

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListCommunityPostsDto): Promise<CommunityPostPageResponse> {
    const cursor = this.parseCursor(query.cursor);
    const posts = await this.prisma.communityPost.findMany({
      where: {
        ...(query.category === undefined ? {} : { category: query.category }),
        ...(cursor === null
          ? {}
          : {
              OR: [
                { createdAt: { lt: cursor.createdAt } },
                { createdAt: cursor.createdAt, id: { lt: cursor.id } },
              ],
            }),
      },
      include: postInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
    });
    const hasMore = posts.length > query.limit;
    const page = hasMore ? posts.slice(0, query.limit) : posts;
    const last = page.at(-1);
    return {
      items: page.map(toPostResponse),
      nextCursor:
        hasMore && last !== undefined
          ? encodeCommunityCursor({ createdAt: last.createdAt, id: last.id })
          : null,
    };
  }

  async createPost(
    user: AuthenticatedUser,
    input: CreateCommunityPostDto,
  ): Promise<CommunityPostResponse> {
    this.assertCanWrite(user);
    const post = await this.prisma.communityPost.create({
      data: {
        authorId: user.id,
        category: input.category,
        areaText: input.areaText?.trim() || null,
        title: input.title,
        content: input.content,
      },
      include: postInclude,
    });
    return toPostResponse(post);
  }

  async get(id: string): Promise<CommunityPostDetailResponse> {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      include: {
        ...postInclude,
        comments: {
          include: { author: { select: { id: true, nickname: true } } },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          take: 100,
        },
      },
    });
    if (post === null) throw this.notFound();
    return {
      ...toPostResponse(post),
      comments: post.comments.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        author: comment.author,
        content: comment.removedAt === null ? comment.content : REMOVED_COMMENT,
        removed: comment.removedAt !== null,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    };
  }

  async createComment(
    postId: string,
    user: AuthenticatedUser,
    input: CreateCommunityCommentDto,
  ): Promise<CommunityCommentResponse> {
    this.assertCanWrite(user);
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true, removedAt: true },
    });
    if (post === null || post.removedAt !== null) throw this.notFound();
    const comment = await this.prisma.communityComment.create({
      data: { postId, authorId: user.id, content: input.content },
      include: { author: { select: { id: true, nickname: true } } },
    });
    return {
      id: comment.id,
      postId: comment.postId,
      author: comment.author,
      content: comment.content,
      removed: false,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }

  private assertCanWrite(user: AuthenticatedUser): void {
    if (user.role === 'ADMIN') {
      throw new ProblemException(
        'COMMUNITY_WRITE_NOT_ALLOWED',
        '관리자 계정은 커뮤니티에 글이나 댓글을 작성할 수 없습니다.',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private parseCursor(value: string | undefined): CommunityCursor | null {
    if (value === undefined) return null;
    const cursor = decodeCommunityCursor(value);
    if (cursor === null) {
      throw new ProblemException(
        'INVALID_CURSOR',
        '페이지 위치가 올바르지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return cursor;
  }

  private notFound(): ProblemException {
    return new ProblemException(
      'COMMUNITY_POST_NOT_FOUND',
      '커뮤니티 게시글을 찾을 수 없습니다.',
      HttpStatus.NOT_FOUND,
    );
  }
}

function toPostResponse(post: PostRecord): CommunityPostResponse {
  const removed = post.removedAt !== null;
  return {
    id: post.id,
    author: post.author,
    category: post.category,
    areaText: removed ? null : post.areaText,
    title: removed ? '숨김 처리된 게시글' : post.title,
    content: removed ? REMOVED_POST : post.content,
    removed,
    commentCount: post._count.comments,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}
