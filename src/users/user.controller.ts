import { Body, Controller, Patch, UseGuards, Get, Param, Delete } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth-guard";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "src/auth/dto/update-user.dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Role } from "src/auth/enums/role.enum";


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
    @Roles(Role.ADMIN)
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    getAllUsers() {
        return this.usersService.findAll();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get(':id')
    getUserById(
        @Param('id')
        id: string,
    ) {
        return this.usersService.findUserById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(":id")
    deleteUser(
        @Param('id')
        id: string,
    ) {
        return this.usersService.deleteUser(id);
    }

}