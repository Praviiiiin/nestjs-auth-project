import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(
    Strategy,
    'google',
) {
    constructor(
        private readonly configService: ConfigService
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

    }
}