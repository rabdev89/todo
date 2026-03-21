import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './auth.types';
import { LOGIN_FAILED_MESSAGE } from './auth.constants';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email;
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        ...(dto.displayName != null ? { displayName: dto.displayName } : {}),
      },
      select: { id: true, email: true, displayName: true },
    });

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user) throw new UnauthorizedException(LOGIN_FAILED_MESSAGE);

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException(LOGIN_FAILED_MESSAGE);

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token };
  }

  async generateJwt(userId: string, email: string): Promise<string> {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwt.signAsync(payload);
  }

  /**
   * Link or create user by email for OAuth providers (same email = same account).
   * Uses a random password hash so password login cannot succeed for OAuth-only users.
   */
  async findOrCreateOAuthUser(email: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
    if (existing) return existing;

    const passwordHash = await bcrypt.hash(
      `oauth:${randomBytes(32).toString('hex')}`,
      SALT_ROUNDS,
    );
    return this.prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });
  }
}
