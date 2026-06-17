import { Body, Controller, Patch, UseGuards, Get } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth-guard";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "src/auth/dto/update-user.dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { User } from "./schemas/user.schema";

@Controller('users')
export class UsersController {
    constructor(
        private usersService : UsersService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    updateProfile(
        @CurrentUser() user: any,

        @Body()
        updateUserDto: UpdateUserDto
    ) {
        return this.usersService.updateUser(
            user._id,
            updateUserDto
        );
    }   
    
    @UseGuards(
        JwtAuthGuard,
        RolesGuard,
    )
    @Roles('admin')
    @Get('admin')
    adminRoute(
        @CurrentUser()
        user: any,
    ) {
        return {
            message: "Welcome Admin",
            user,
        };
    }
}