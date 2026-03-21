import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.auth.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.auth.login(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This method is just for triggering the AuthGuard
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleAuthCallback(@Req() req: Request) {
    const user = req.user as { id: string; email: string };
    const token = await this.auth.generateJwt(user.id, user.email);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return {
      url: `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`,
      statusCode: 302,
    };
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookAuth() {
    // This method is just for triggering the AuthGuard
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @Redirect()
  async facebookAuthCallback(@Req() req: Request) {
    const user = req.user as { id: string; email: string };
    const token = await this.auth.generateJwt(user.id, user.email);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return {
      url: `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`,
      statusCode: 302,
    };
  }
}
