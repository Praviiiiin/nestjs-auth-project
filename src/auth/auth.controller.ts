import { Controller, Body, Post, Get, UseGuards, Patch, Query, Req  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator'
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { THROTTLER } from 'src/mail/constants/throttler.constants';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';

@ApiTags('Authentication')
@Controller('auth')

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Throttle({
        default: {
            limit: THROTTLER.REGISTER.LIMIT,
            ttl: THROTTLER.REGISTER.TTL,
        }
    })
    @Post('register')
    register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }

    @Throttle({
        default: {
            limit: THROTTLER.LOGIN.LIMIT, 
            ttl: THROTTLER.LOGIN.TTL,
        },
    })
    @Post('login')
    login(@Body() body: LoginDto) {
        return this.authService.login(body);
    }

    @SkipThrottle()
    @Post('refresh')
    refresh(
        @Body()
        dto: RefreshTokenDto,
    ) {
        return this.authService.refreshToken(
            dto.refreshToken,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@CurrentUser() user: any) {
        return user;
    }

    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    changePassword(
        @CurrentUser() user: any,

        @Body()
        dto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(
            user._id,
            dto.currentPassword,
            dto.newPassword,
        )
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(
        @CurrentUser() user: any
    ) {
        return this.authService.logout(
            user._id,
        );
    }

    @Throttle({
        default: {
            limit: THROTTLER.FORGOT_PASSWORD.LIMIT, 
            ttl: THROTTLER.FORGOT_PASSWORD.TTL,
        },
    })
    @Post('forgot-password')
    forgotPassword(
        @Body()
        dto: ForgotPasswordDto,
    ) {
        return this.authService.forgotPassword(
            dto.email,
        );
    }

    @Throttle({
        default: {
            limit: THROTTLER.RESET_PASSWORD.LIMIT, 
            ttl: THROTTLER.RESET_PASSWORD.TTL,
        },
    })
    @Post('reset-password')
    resetPassword(
        @Body()
        dto: ResetPasswordDto
    ) {
        return this.authService.resetPassword(
            dto.token,
            dto.newPassword
        );
    }

    @Get('verify-email')
    verifyEmail(
        @Query('token')
        token: string,
    ) {
        return this.authService.verifyEmail(
            token,
        );
    }

    @Throttle({
        default: {
            limit: THROTTLER.RESEND_VERIFICATION.LIMIT, 
            ttl: THROTTLER.RESEND_VERIFICATION.TTL,
        },
    })
    @Post('resend-verification')
    resendVerification(
        @Body()
        dto: ResendVerificationDto
    ) {
        return this.authService.resendVerification(
            dto.email
        )
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    googleLogin() {}

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleCallBack(
        @Req() req,
    ) {
        return this.authService.loginGoogleUser(
            req.user,
        );
    }

    @Get('github')
    @UseGuards(GithubAuthGuard)
    githubLogin() {}

    @Get('github/callback')
    @UseGuards(GithubAuthGuard)
    async githubCallBack(
        @Req() req,
    ) {
        return await this.authService.loginGithubUser(
            req.user,
        )
    }



}



