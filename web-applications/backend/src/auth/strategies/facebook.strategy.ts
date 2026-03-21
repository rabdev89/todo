import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { VerifyCallback } from 'passport-oauth2';
import { Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';

interface FacebookProfile {
  emails?: Array<{ value: string }>;
}

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private disabled = false;

  constructor(private readonly authService: AuthService) {
    const appID = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const wouldBeDisabled = !appID || !appSecret;

    super({
      clientID: appID ?? 'DUMMY_FACEBOOK_APP_ID',
      clientSecret: appSecret ?? 'DUMMY_FACEBOOK_APP_SECRET',
      callbackURL:
        process.env.FACEBOOK_CALLBACK_URL ||
        'http://localhost:3000/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails'],
    });

    if (wouldBeDisabled) {
      this.disabled = true;
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: FacebookProfile,
    done: VerifyCallback,
  ) {
    if (this.disabled) {
      return done(new Error('FacebookStrategy is disabled'));
    }
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Facebook profile'));
      }

      const user = await this.authService.findOrCreateOAuthUser(email);

      return done(null, {
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      return done(error as Error);
    }
  }
}
