import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminGuard } from './guards/admin.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { PasswordEmailService } from './password-email.service';
import { PasswordRecoveryService } from './password-recovery.service';
import { SocialAuthService } from './social-auth.service';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordEmailService,
    PasswordRecoveryService,
    SocialAuthService,
    JwtStrategy,
    JwtAuthGuard,
    AdminGuard,
  ],
  exports: [AuthService, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}
