import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-github2";
import { GithubUserDto } from "../dto/github-user.dto";
import { AuthService } from "../auth.service";

@Injectable()
export class GithubStrategy extends PassportStrategy(
    Strategy,
    'github'
) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
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

            scope: [
                'read:user',
                'user:email'
            ],
            
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile
    ) {

        console.log(profile);

        const githubUser: GithubUserDto = {
            githubId: profile.id,
            email: profile.emails?.[0].value || '',
            name: profile.displayName ?? profile.username ?? '',
            avatar: profile.photos?.[0].value,
        }

        return await this.authService.validateGithubUser(
            githubUser,
        );
    }
}