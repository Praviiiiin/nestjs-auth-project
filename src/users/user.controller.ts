import { Body, Controller, Patch, UseGuards, Get, Post, Param, Delete, Query, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth-guard";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "src/auth/dto/update-user.dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Role } from "src/auth/enums/role.enum";
import { UpdateRoleDto } from "src/auth/dto/update-role.dto";
import { PaginationDto } from "src/auth/dto/pagination.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags('Users')
@ApiBearerAuth()
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
    getAllUsers(
        @Query()
        query: PaginationDto
    ) {
        return this.usersService.findAll(Number(query.page) || 1, Number(query.limit) || 10, query.search || '');
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id/role')
    updateRole(
        @Param('id')
        id: string,

        @Body()
        dto: UpdateRoleDto
    ) {
        return this.usersService.updateRole(
            id,
            dto.role,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(
        @CurrentUser() 
        user: any
    ) {
        return user;
    }    

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file'),
    )
    uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [


                    new MaxFileSizeValidator({
                        maxSize: 2 * 1024 * 1024,
                    }),

                    new FileTypeValidator({
                        fileType: /(jpg|png|jpeg)$/i,
                    }),
                ],
            }),
        )
        file: any
    )   {
        return {
            filename: file.originalname,

            size: file.size,

            type: file.mimetype
        };
    } 
}