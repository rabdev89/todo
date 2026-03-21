import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        email: string;
        displayName: string | null;
        id: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    googleAuth(): void;
    googleAuthCallback(req: Request): Promise<{
        url: string;
        statusCode: number;
    }>;
    facebookAuth(): void;
    facebookAuthCallback(req: Request): Promise<{
        url: string;
        statusCode: number;
    }>;
}
