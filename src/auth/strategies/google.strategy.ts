import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { GoogleUserDto } from "../dto/google-user.dto";

@Injectable()
export class GoogleStrategy extends PassportStrategy(
    Strategy,
    'google',
) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.getOrThrow(
                'GOOGLE_CLIENT_ID',
            ),

            clientSecret: configService.getOrThrow(
                'GOOGLE_CLIENT_SECRET',
            ),

            callbackURL: configService.getOrThrow(
                'GOOGLE_CALLBACK_URL'
            ),

            scope: [
                'email',
                'profile',
            ]

        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
    ) {
        const googleUser: GoogleUserDto = {
            googleId: profile.id,

            email: profile.emails?.[0].value ?? '',

            avatar: profile.photos?.[0].value,

            name: profile.displayName
        };
        
        return await this.authService.validateGoogleUser(
            googleUser,
        );
    }
}