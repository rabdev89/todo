import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { VerifyCallback } from 'passport-oauth2';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

interface GoogleProfile {
  emails?: Array<{ value: string }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private disabled = false;

  constructor(private readonly authService: AuthService) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const wouldBeDisabled = !clientID || !clientSecret;

    super({
      clientID: clientID ?? 'DUMMY_GOOGLE_CLIENT_ID',
      clientSecret: clientSecret ?? 'DUMMY_GOOGLE_CLIENT_SECRET',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3000/auth/google/callback',
      scope: ['profile', 'email'],
    });

    if (wouldBeDisabled) {
      this.disabled = true;
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ) {
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
    } catch (error) {
      return done(error as Error);
    }
  }
}
