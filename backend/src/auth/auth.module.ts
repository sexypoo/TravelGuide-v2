import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminGuard } from './guards/admin.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { PasswordEmailService } from './password-email.service';
import { PasswordRecoveryService } from './password-recovery.service';
import { SocialAuthService } from './social-auth.service';
import { OAuthCredentialCipher } from './oauth-credential-cipher';
import { AccountDeletionService } from './account-deletion.service';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    StorageModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordEmailService,
    PasswordRecoveryService,
    SocialAuthService,
    OAuthCredentialCipher,
    AccountDeletionService,
    JwtStrategy,
    JwtAuthGuard,
    AdminGuard,
  ],
  exports: [AuthService, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}
