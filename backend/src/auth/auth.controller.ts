import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
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

  private get nodeEnvironment(): NodeEnvironment {
    return this.config.get('NODE_ENV', { infer: true });
  }
}
