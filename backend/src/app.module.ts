import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminVerificationsModule } from './admin/verifications/admin-verifications.module';
import { AdminReportsModule } from './admin/reports/admin-reports.module';
import { AnswersModule } from './answers/answers.module';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './config/environment';
import { HealthModule } from './health/health.module';
import { MessagesModule } from './messages/messages.module';
import { QuestionsModule } from './questions/questions.module';
import { ReportsModule } from './reports/reports.module';
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
    AdminReportsModule,
    AnswersModule,
    AuthModule,
    HealthModule,
    MessagesModule,
    QuestionsModule,
    ReportsModule,
    UsersModule,
    RoomsModule,
    VerificationsModule,
  ],
})
export class AppModule {}
