"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const auth_service_1 = require("../auth.service");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    authService;
    disabled = false;
    constructor(authService) {
        const clientID = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const wouldBeDisabled = !clientID || !clientSecret;
        super({
            clientID: clientID ?? 'DUMMY_GOOGLE_CLIENT_ID',
            clientSecret: clientSecret ?? 'DUMMY_GOOGLE_CLIENT_SECRET',
            callbackURL: process.env.GOOGLE_CALLBACK_URL ||
                'http://localhost:3000/auth/google/callback',
            scope: ['profile', 'email'],
        });
        this.authService = authService;
        if (wouldBeDisabled) {
            this.disabled = true;
        }
    }
    async validate(accessToken, refreshToken, profile, done) {
        if (this.disabled) {
            return done(new Error('GoogleStrategy is disabled'));
        }
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error('No email found in Google profile'));
            }
            const user = await this.authService.findOrCreateOAuthUser(email);
            return done(null, {
                id: user.id,
                email: user.email,
            });
        }
        catch (error) {
            return done(error);
        }
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], GoogleStrategy);
//# sourceMappingURL=google.strategy.js.map