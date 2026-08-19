import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { Environment, NodeEnvironment } from '../config/environment';
import {
  AUTH_COOKIE_NAME,
  createAuthCookieOptions,
  createClearCookieOptions,
} from './auth-cookie';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './authenticated-user';
import { CurrentUser } from './current-user.decorator';
import {
  toCurrentUserResponse,
  type CurrentUserResponse,
} from './dto/current-user.response';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SocialCallbackDto, SocialStartQueryDto } from './dto/social-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';
import { PasswordRecoveryService } from './password-recovery.service';
import { SocialAuthService } from './social-auth.service';
import { AccountDeletionService } from './account-deletion.service';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly passwordRecovery: PasswordRecoveryService,
    private readonly socialAuth: SocialAuthService,
    private readonly accountDeletion: AccountDeletionService,
    private readonly config: ConfigService<Environment, true>,
  ) {}

  @Post('register')
  async register(
    @Body() input: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CurrentUserResponse> {
    const result = await this.auth.register(input);
    this.setAuthCookie(response, result.token);
    return toCurrentUserResponse(result.user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit('LOGIN')
  @UseGuards(RateLimitGuard)
  async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CurrentUserResponse> {
    const result = await this.auth.login(input);
    this.setAuthCookie(response, result.token);
    return toCurrentUserResponse(result.user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(
      AUTH_COOKIE_NAME,
      createClearCookieOptions(this.nodeEnvironment),
    );
  }

  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: DeleteAccountDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.accountDeletion.deleteAccount(user.id, input);
    response.clearCookie(
      AUTH_COOKIE_NAME,
      createClearCookieOptions(this.nodeEnvironment),
    );
  }

  @Get('capabilities')
  capabilities(): {
    passwordReset: boolean;
    socialProviders: string[];
  } {
    return {
      passwordReset: this.passwordRecovery.configured,
      socialProviders: this.socialAuth.capabilities(),
    };
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RateLimit('PASSWORD_RESET')
  @UseGuards(RateLimitGuard)
  async forgotPassword(@Body() input: ForgotPasswordDto): Promise<void> {
    await this.passwordRecovery.requestReset(input.email);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RateLimit('PASSWORD_RESET')
  @UseGuards(RateLimitGuard)
  async resetPassword(@Body() input: ResetPasswordDto): Promise<void> {
    await this.passwordRecovery.resetPassword(input.token, input.password);
  }

  @Get('oauth/:provider/start')
  async socialStart(
    @Param('provider') provider: string,
    @Query() query: SocialStartQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    response.redirect(
      await this.socialAuth.authorizationUrl(
        provider,
        query.next,
        query.mode,
        query.termsAgreed,
      ),
    );
  }

  @Get('oauth/:provider/callback')
  async socialCallbackGet(
    @Param('provider') provider: string,
    @Query() query: SocialCallbackDto,
    @Res() response: Response,
  ): Promise<void> {
    await this.completeSocialCallback(response, {
      provider,
      ...query,
    });
  }

  @Post('oauth/:provider/callback')
  async socialCallbackPost(
    @Param('provider') provider: string,
    @Body() body: SocialCallbackDto,
    @Res() response: Response,
  ): Promise<void> {
    await this.completeSocialCallback(response, { provider, ...body });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): CurrentUserResponse {
    return toCurrentUserResponse(user);
  }

  private setAuthCookie(response: Response, token: string): void {
    response.cookie(
      AUTH_COOKIE_NAME,
      token,
      createAuthCookieOptions(
        this.nodeEnvironment,
        this.config.get('JWT_EXPIRES_IN_SECONDS', { infer: true }),
      ),
    );
  }

  private async completeSocialCallback(
    response: Response,
    input: {
      provider: string;
      code?: string;
      state?: string;
      error?: string;
    },
  ): Promise<void> {
    try {
      const result = await this.socialAuth.callback(input);
      const session = await this.auth.createSession(result.user);
      this.setAuthCookie(response, session.token);
      response.redirect(
        new URL(
          result.nextPath,
          this.config.get('WEB_ORIGIN', { infer: true }),
        ).toString(),
      );
    } catch {
      const loginUrl = new URL(
        '/auth/login',
        this.config.get('WEB_ORIGIN', { infer: true }),
      );
      loginUrl.searchParams.set('socialError', 'failed');
      response.redirect(loginUrl.toString());
    }
  }

  private get nodeEnvironment(): NodeEnvironment {
    return this.config.get('NODE_ENV', { infer: true });
  }
}
