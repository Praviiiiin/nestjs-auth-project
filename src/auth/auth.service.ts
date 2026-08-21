import { Injectable, BadRequestException, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { MailProvider } from 'src/mail/interface/mail-provider.interface';
import { InjectQueue } from '@nestjs/bullmq';
import {  Queue } from 'bullmq';
import { QUEUE_OPTIONS, QUEUES } from 'src/mail/constants/queue.constants';
import { MAIL_JOBS } from 'src/mail/constants/job.constants';
import { SECURITY } from 'src/mail/constants/security.constants';
import { GoogleUserDto } from './dto/google-user.dto';
import { UserDocument } from 'src/users/schemas/user.schema';
import { GithubUserDto } from './dto/github-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,

        @Inject('MAIL_PROVIDER')
        private mailService: MailProvider,

        @InjectQueue(QUEUES.MAIL)
        private readonly mailQueue: Queue
    ) {}

    async register(body: RegisterDto) {
        const {
            name,
            email,
            password,
        } = body;

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
            await bcrypt.hash(
                password,
                10,
            );

        const verificationToken =
            crypto.randomBytes(32)
                .toString('hex');

        await this.userService.create({
            name,
            email,
            password: hashedPassword,
            emailVerificationToken:
            verificationToken,
        });

        await this.mailQueue.add(MAIL_JOBS.SEND_VERIFICATION,
            {
                email,
                token: verificationToken,
            },
        );

        return {
            message:
                'User registered successfully. Please verify your email.',
        };
    }

    async login(body: LoginDto) {
        const {
            email,
            password,
        } = body;

        const user =
            await this.userService.findByEmail(
                email,
            );

        if (!user) {
            throw new BadRequestException(
                'Invalid Credentials',
            );
        }

        if (
            user.lockUntil &&
            user.lockUntil > new Date()
        ) {
            throw new BadRequestException(
                'Account is temporarily locked. Try again later.',
            );
        }

        if(!user.password) {
            throw new UnauthorizedException(
                'This account uses Google Sign-In. Please continue with Google',
            );
        }

        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password,
            );

        if (!isPasswordValid) {

            const attempts =
                user.failedLoginAttempts + 1;

            if (attempts >= 5) {

                await this.userService.updateLoginAttempts(
                    user._id.toString(),
                    QUEUE_OPTIONS.ATTEMPTS,
                    new Date(
                        Date.now() +
                        SECURITY.ACCOUNT_LOCK_MINUTES,
                    ),
                );

                throw new BadRequestException(
                    'Account locked for 15 minutes.',
                );
            }

            await this.userService.updateLoginAttempts(
                user._id.toString(),
                QUEUE_OPTIONS.ATTEMPTS,
            );

            this.logger.warn(`Invalid login attempt for ${email}`);
            throw new BadRequestException('Invalid Credentials')
        }

        if (!user.isVerified) {
            throw new BadRequestException(
                'Please verify your email first.',
            );
        }

        await this.userService.updateLoginAttempts(
            user._id.toString(),
            3,
            undefined,
        );

        return await this.generateAuthResponse(
            user,
        );

    }

    private async generateAuthResponse(
        user: UserDocument,
    ) {
        const payload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const accessToken =
            this.jwtService.sign(
                payload,
            );

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
            message:
                'Login Successful',
            accessToken,
            refreshToken,
        };
    }

    async loginGoogleUser(
        user: UserDocument,
    ) {
        return this.generateAuthResponse(
            user,
        );
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

        if(!user.password) {
            throw new UnauthorizedException(
                'This account uses Google Sign-In. Please continue with Google',
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
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const accessToken =
            this.jwtService.sign(
                payload,
            );

        return {
            accessToken,
        };
    }

    async logout(
        userId: string,
    ) {
        await this.userService.removeRefreshToken(
            userId,
        );

        return {
            message:
                'Logged out successfully',
        };
    }

    async forgotPassword(
        email: string,
    ) {
        const user =
            await this.userService.findByEmail(
                email,
            );

        if (!user) {
            throw new BadRequestException(
                'User not found',
            );
        }

        const token =
            crypto.randomBytes(32)
                .toString('hex');

        const expires =
            new Date(
                Date.now() +
                SECURITY.ACCOUNT_LOCK_MINUTES,
            );

        await this.userService.updateResetToken(
            user._id.toString(),
            token,
            expires,
        );

        await this.mailQueue.add(
            MAIL_JOBS.SEND_RESET_PASSWORD,
            {
                email,
                resetPasswordToken: token,
            },
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
        );

        return {
            message:
                'Password reset email sent successfully.',
        };
    }

    async resetPassword(
        token: string,
        newPassword: string,
    ) {
        const user =
            await this.userService.findResetToken(
                token,
            );

        if (!user) {
            throw new BadRequestException(
                'Invalid or expired token',
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10,
            );

        await this.userService.updatePassword(
            user._id.toString(),
            hashedPassword,
        );

        await this.userService.clearResetToken(
            user._id.toString(),
        );

        return {
            message:
                'Password reset successful',
        };
    }

        async verifyEmail(
        token: string,
    ) {
        const user =
            await this.userService.findByVerificationToken(
                token,
            );

        if (!user) {
            throw new BadRequestException(
                'Invalid verification token',
            );
        }

        user.isVerified = true;

        user.emailVerificationToken =
            undefined;

        await user.save();

        return {
            message:
                'Email verified successfully',
        };
    }

    async resendVerification(
        email: string,
    ) {
        const user =
            await this.userService.findByEmail(
                email,
            );

        if (!user) {
            throw new BadRequestException(
                'User not found',
            );
        }

        if (user.isVerified) {
            throw new BadRequestException(
                'Email already verified',
            );
        }

        const verificationToken =
            crypto.randomBytes(32)
                .toString('hex');

        user.emailVerificationToken =
            verificationToken;

        await user.save();

        await this.mailQueue.add(
            MAIL_JOBS.SEND_VERIFICATION,
            {
                email,
                token: verificationToken,
            },
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
        );

        return {
            message:
                'Verification email sent successfully.',
        };
    }
    
    async validateGoogleUser(
        dto: GoogleUserDto
    ) {
        const existingGoogleUser = await this.userService.findByGoogleId(
            dto.googleId,
        );

        if(existingGoogleUser) {
            return existingGoogleUser;
        }

        const existingUser = await this.userService.findByEmail(
            dto.email,
        )

        if(existingUser) {
            return await this.userService.updateGoogleAccount(
                existingUser._id.toString(),
                dto.googleId,
                dto.avatar,
            );
        }

        const user = await this.userService.create({

            name: dto.name,

            email: dto.email,

            googleId: dto.googleId,

            avatar: dto.avatar,

            provider: 'google',

            isVerified: true,
        });
        return user;
    }

    async validateGithubUser(
        dto: GithubUserDto
    ) {
        const existingGithubUser = await this.userService.findByGithubId(
            dto.githubId
        );

        if(existingGithubUser) {
            return existingGithubUser;
        }

        if(!dto.email) {
            throw new UnauthorizedException(
                'Github account does not provide an email address',
            );
        }

        const existingUser = await this.userService.findByEmail(
            dto.email,
        );

        if(existingUser) {
            return await this.userService.updateGithubAccount(
                existingUser._id.toString(),
                dto.githubId,
                dto.avatar
            )
        }

        const user = await this.userService.create({

            name: dto.name,

            email: dto.email,

            avatar: dto.avatar,


            provider: 'github',
            
            isVerified: true,
        });

        return user;
    }

    async loginGithubUser(
        user: UserDocument
    ) {
        return await this.generateAuthResponse(
            user,
        )
    }

    private readonly logger = new Logger(AuthService.name);
}
