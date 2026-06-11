import { Body, Controller, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth-guard";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./update-user.dto";

@Controller('users')
export class UsersController {
    constructor(
        private usersService : UsersService
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
}