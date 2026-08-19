import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AuthProvider, ReportTargetType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import { PrivateObjectLifecycleService } from '../storage/private-object-lifecycle.service';
import type { DeleteAccountDto } from './dto/delete-account.dto';
import { SocialAuthService } from './social-auth.service';

function accountReauthenticationFailed(): ProblemException {
  return new ProblemException(
    'ACCOUNT_DELETION_REAUTH_FAILED',
    '현재 비밀번호를 확인해 주세요.',
    HttpStatus.UNAUTHORIZED,
  );
}

@Injectable()
export class AccountDeletionService {
  private readonly logger = new Logger(AccountDeletionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly privateObjects: PrivateObjectLifecycleService,
    private readonly socialAuth: SocialAuthService,
  ) {}

  async deleteAccount(userId: string, input: DeleteAccountDto): Promise<void> {
    const account = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        passwordHash: true,
        role: true,
        authIdentities: {
          where: { provider: AuthProvider.APPLE },
          select: { refreshTokenCiphertext: true },
        },
      },
    });
    if (account === null) {
      throw new ProblemException(
        'INVALID_SESSION',
        '유효하지 않은 로그인 세션입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (account.role === UserRole.ADMIN) {
      throw new ProblemException(
        'ADMIN_ACCOUNT_DELETION_NOT_ALLOWED',
        '관리자 계정은 이 화면에서 삭제할 수 없습니다.',
        HttpStatus.FORBIDDEN,
      );
    }
    if (
      account.passwordHash !== null &&
      (input.password === undefined ||
        !(await bcrypt.compare(input.password, account.passwordHash)))
    ) {
      throw accountReauthenticationFailed();
    }

    const appleIdentity = account.authIdentities[0];
    const appleCiphertext = appleIdentity?.refreshTokenCiphertext;
    if (typeof appleCiphertext === 'string') {
      await this.socialAuth.revokeAppleRefreshToken(appleCiphertext);
    } else if (appleIdentity !== undefined) {
      this.logger.warn(
        'Legacy Apple identity deleted without a stored refresh token',
      );
    }

    const objectKeys = await this.prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'delete-account:' + userId}))`;
      const user = await transaction.user.findUnique({
        where: { id: userId },
        select: { email: true, avatarObjectKey: true, role: true },
      });
      if (user === null) return [];
      if (user.role === UserRole.ADMIN) {
        throw new ProblemException(
          'ADMIN_ACCOUNT_DELETION_NOT_ALLOWED',
          '관리자 계정은 이 화면에서 삭제할 수 없습니다.',
          HttpStatus.FORBIDDEN,
        );
      }

      const questions = await transaction.question.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          imageObjectKey: true,
          answers: { select: { id: true, imageObjectKey: true } },
        },
      });
      const ownAnswers = await transaction.answer.findMany({
        where: { authorId: userId },
        select: { id: true, imageObjectKey: true },
      });
      const messages = await transaction.chatMessage.findMany({
        where: { authorId: userId },
        select: { id: true, imageObjectKey: true },
      });
      const verifications = await transaction.verification.findMany({
        where: { userId },
        select: { proofObjectKey: true },
      });
      const posts = await transaction.communityPost.findMany({
        where: { authorId: userId },
        select: { id: true, comments: { select: { id: true } } },
      });
      const ownComments = await transaction.communityComment.findMany({
        where: { authorId: userId },
        select: { id: true },
      });

      const questionIds = questions.map((question) => question.id);
      const questionAnswers = questions.flatMap((question) => question.answers);
      const answerIds = [
        ...questionAnswers.map((answer) => answer.id),
        ...ownAnswers.map((answer) => answer.id),
      ];
      const messageIds = messages.map((message) => message.id);
      const postIds = posts.map((post) => post.id);
      const commentIds = [
        ...posts.flatMap((post) => post.comments.map((comment) => comment.id)),
        ...ownComments.map((comment) => comment.id),
      ];

      await transaction.report.deleteMany({
        where: {
          OR: [
            { targetType: ReportTargetType.USER, targetId: userId },
            {
              targetType: ReportTargetType.QUESTION,
              targetId: { in: questionIds },
            },
            {
              targetType: ReportTargetType.ANSWER,
              targetId: { in: answerIds },
            },
            {
              targetType: ReportTargetType.MESSAGE,
              targetId: { in: messageIds },
            },
            {
              targetType: ReportTargetType.COMMUNITY_POST,
              targetId: { in: postIds },
            },
            {
              targetType: ReportTargetType.COMMUNITY_COMMENT,
              targetId: { in: commentIds },
            },
          ],
        },
      });
      await transaction.preorderRegistration.deleteMany({
        where: { email: user.email },
      });
      await transaction.user.delete({ where: { id: userId } });

      return [
        user.avatarObjectKey,
        ...verifications.map((verification) => verification.proofObjectKey),
        ...questions.map((question) => question.imageObjectKey),
        ...questionAnswers.map((answer) => answer.imageObjectKey),
        ...ownAnswers.map((answer) => answer.imageObjectKey),
        ...messages.map((message) => message.imageObjectKey),
      ].filter((key): key is string => key !== null);
    });

    await Promise.all(
      [...new Set(objectKeys)].map((key) =>
        this.privateObjects.deleteBestEffort(key),
      ),
    );
  }
}
