import { Controller, Body, Post, Get, Req, UseGuards  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator'

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

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@CurrentUser() user: any) {
        return user;
    }
}



