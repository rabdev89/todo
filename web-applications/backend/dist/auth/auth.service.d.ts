import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        email: string;
        displayName: string | null;
        id: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    generateJwt(userId: string, email: string): Promise<string>;
    findOrCreateOAuthUser(email: string): Promise<{
        email: string;
        id: string;
    }>;
}
