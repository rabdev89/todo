import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LOGIN_FAILED_MESSAGE } from './auth.constants';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  describe('login', () => {
    let service: AuthService;
    const prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    beforeEach(async () => {
      jest.clearAllMocks();
      const moduleRef = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: PrismaService, useValue: prisma },
          {
            provide: JwtService,
            useValue: { signAsync: jest.fn().mockResolvedValue('jwt-token') },
          },
        ],
      }).compile();

      service = moduleRef.get(AuthService);
    });

    function expectLoginFailed(err: unknown) {
      expect(err).toBeInstanceOf(UnauthorizedException);
      expect((err as UnauthorizedException).getResponse()).toMatchObject({
        message: LOGIN_FAILED_MESSAGE,
        statusCode: 401,
      });
    }

    it('uses the same error when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      try {
        await service.login({ email: 'missing@example.com', password: 'Password123!' });
      } catch (e) {
        expectLoginFailed(e);
      }
    });

    it('uses the same error when password is wrong', async () => {
      const hash = await bcrypt.hash('CorrectPass123!', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@example.com',
        passwordHash: hash,
      });

      try {
        await service.login({ email: 'user@example.com', password: 'WrongPass123!' });
      } catch (e) {
        expectLoginFailed(e);
      }
    });

    it('returns the exact same message string for unknown user and wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      let missingUserMsg = '';
      try {
        await service.login({ email: 'ghost@example.com', password: 'Password123!' });
      } catch (e) {
        missingUserMsg = String(
          ((e as UnauthorizedException).getResponse() as { message: string }).message,
        );
      }

      const hash = await bcrypt.hash('RightPass123!', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u2',
        email: 'real@example.com',
        passwordHash: hash,
      });
      let badPasswordMsg = '';
      try {
        await service.login({ email: 'real@example.com', password: 'WrongPass123!' });
      } catch (e) {
        badPasswordMsg = String(
          ((e as UnauthorizedException).getResponse() as { message: string }).message,
        );
      }

      expect(missingUserMsg).toBe(badPasswordMsg);
      expect(missingUserMsg).toBe(LOGIN_FAILED_MESSAGE);
    });
  });
});
