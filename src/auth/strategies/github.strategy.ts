import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile } from "passport";
import { Strategy } from "passport-github2";
import { config } from "process";

@Injectable()
export class GithubStrategy extends PassportStrategy(
    Strategy,
    'github'
) {
    constructor(
        private readonly configService: ConfigService,
    ) {
        super({
            clientID: configService.getOrThrow(
                'GITHUB_CLIENT_ID',
            ),

            clientSecret: configService.getOrThrow(
                'GITHUB_CLIENT_SECRET',
            ),

            callbackURL: configService.getOrThrow(
                'GITHUB_CALLBACK_URL',
            ),
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile
    ) {

    }
}