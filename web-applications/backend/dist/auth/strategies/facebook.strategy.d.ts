import type { VerifyCallback } from 'passport-oauth2';
import { Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';
interface FacebookProfile {
    emails?: Array<{
        value: string;
    }>;
}
declare const FacebookStrategy_base: new (...args: [options: import("passport-facebook").StrategyOptionsWithRequest] | [options: import("passport-facebook").StrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class FacebookStrategy extends FacebookStrategy_base {
    private readonly authService;
    private disabled;
    constructor(authService: AuthService);
    validate(accessToken: string, refreshToken: string, profile: FacebookProfile, done: VerifyCallback): Promise<void>;
}
export {};
