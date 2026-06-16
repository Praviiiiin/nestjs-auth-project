import { Controller, Body, Post, Get, Req, UseGuards, Patch  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator'
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }

    @Post('login')
    login(@Body() body: LoginDto) {
        return this.authService.login(body);
    }

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

}



