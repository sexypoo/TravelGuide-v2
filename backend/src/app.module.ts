import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminVerificationsModule } from './admin/verifications/admin-verifications.module';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './config/environment';
import { HealthModule } from './health/health.module';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';
import { VerificationsModule } from './verifications/verifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    AdminVerificationsModule,
    AuthModule,
    HealthModule,
    UsersModule,
    RoomsModule,
    VerificationsModule,
  ],
})
export class AppModule {}
