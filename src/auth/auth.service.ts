import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
    ) {}

    async register(body: any) {
        const { name, email, password } = body;

        const existingUser =
            await this.userService.findByEmail(
                email,
            );

        if (existingUser) {
            throw new BadRequestException(
                'Email already exists',
            );
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user =
            await this.userService.create({
                name,
                email,
                password: hashedPassword,
            });

        return {
            message:
                'User registered successfully',
            user,
        };
    }

    async login(body: any) {
        const { email, password } = body;

        const user =
            await this.userService.findByEmail(
                email,
            );

        if (!user) {
            throw new BadRequestException(
                'Invalid Credentials',
            );
        }

        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password,
            );

        if (!isPasswordValid) {
            throw new BadRequestException(
                'Invalid Credentials',
            );
        }

        const payload = {
            sub: user._id,
            email: user.email,
        };

        const accessToken =
            this.jwtService.sign(payload);

        const refreshToken =
            this.jwtService.sign(
                payload,
                {
                    secret:
                        process.env.JWT_REFRESH_SECRET,

                    expiresIn: '7d',
                },
            );

        const hashedRefreshToken =
            await bcrypt.hash(
                refreshToken,
                10,
            );

        await this.userService.updateRefreshToken(
            user._id.toString(),
            hashedRefreshToken,
        );

        return {
            message: 'Login Successful',
            accessToken,
            refreshToken,
        };
    }

    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
    ) {
        const user =
            await this.userService.findById(
                userId,
            );

        if (!user) {
            throw new BadRequestException(
                'User not found',
            );
        }

        const isPasswordValid =
            await bcrypt.compare(
                currentPassword,
                user.password,
            );

        if (!isPasswordValid) {
            throw new BadRequestException(
                'Current password is invalid',
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10,
            );

        await this.userService.updatePassword(
            userId,
            hashedPassword,
        );

        return {
            message:
                'Password changed successfully',
        };
    }

    async refreshToken(
        refreshToken: string,
    ) {
        const decoded: any =
            this.jwtService.verify(
                refreshToken,
                {
                    secret:
                        process.env.JWT_REFRESH_SECRET,
                },
            );

        const user =
            await this.userService.findById(
                decoded.sub,
            );

        if (
            !user ||
            !user.refreshToken
        ) {
            throw new BadRequestException(
                'Access denied',
            );
        }

        const isRefreshTokenValid =
            await bcrypt.compare(
                refreshToken,
                user.refreshToken,
            );

        if (!isRefreshTokenValid) {
            throw new BadRequestException(
                'Access denied',
            );
        }

        const payload = {
            sub: user._id,
            email: user.email,
        };

        const accessToken =
            this.jwtService.sign(payload);

        return {
            accessToken,
        };
    }

    async logout(
        userId: string,
    ) {
        await this.userService.removeRefreshToken(
            userId
        );
        return {
            message: 'Logged out successfully'
        };
    }
}