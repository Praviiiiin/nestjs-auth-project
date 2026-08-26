import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService,
                private usersService: UsersService) {

        super({
            jwtFromRequest:
            ExtractJwt.fromAuthHeaderAsBearerToken(),

            ignoreExpiration: true,

            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.findById(payload.sub);
        if(!user) {
            return null;
        }

        const { password, refreshToken, ...safeUser } = user.toObject();
        return safeUser;
    }
}
