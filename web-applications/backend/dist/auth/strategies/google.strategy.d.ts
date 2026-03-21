import type { VerifyCallback } from 'passport-oauth2';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
interface GoogleProfile {
    emails?: Array<{
        value: string;
    }>;
}
declare const GoogleStrategy_base: new (...args: [options: import("passport-google-oauth20").StrategyOptionsWithRequest] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GoogleStrategy extends GoogleStrategy_base {
    private readonly authService;
    private disabled;
    constructor(authService: AuthService);
    validate(accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback): Promise<void>;
}
export {};
