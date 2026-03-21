"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_constants_1 = require("./auth.constants");
const SALT_ROUNDS = 12;
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async register(dto) {
        const email = dto.email;
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already in use');
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
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true, email: true, passwordHash: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException(auth_constants_1.LOGIN_FAILED_MESSAGE);
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException(auth_constants_1.LOGIN_FAILED_MESSAGE);
        const payload = { sub: user.id, email: user.email };
        const access_token = await this.jwt.signAsync(payload);
        return { access_token };
    }
    async generateJwt(userId, email) {
        const payload = { sub: userId, email };
        return this.jwt.signAsync(payload);
    }
    async findOrCreateOAuthUser(email) {
        const existing = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true },
        });
        if (existing)
            return existing;
        const passwordHash = await bcrypt.hash(`oauth:${(0, crypto_1.randomBytes)(32).toString('hex')}`, SALT_ROUNDS);
        return this.prisma.user.create({
            data: { email, passwordHash },
            select: { id: true, email: true },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map