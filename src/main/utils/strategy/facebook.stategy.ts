import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID, // ใช้ Facebook Client ID
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET, // ใช้ Facebook Client Secret
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['email', 'name', 'photos'], // ระบุข้อมูลที่ต้องการจาก Facebook
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails ? emails[0].value : null,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
