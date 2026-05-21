import { Controller, Body, Post, Get, Req, UseGuards  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('login')
    login(@Body() body: any) {
        return this.authService.login(body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req:any) {
        return req.user;
    }
}


