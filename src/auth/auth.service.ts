import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService  } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
    ) {}

    async register(body: any) {
        const { name, email, password } = body;

        const existingUser = await this.userService.findByEmail(email);

        if (existingUser) {
            throw new BadRequestException('Email already exists')
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.userService.create({
            name,
            email,
            password: hashedPassword,
        });

        return {
            message: "User registered successfully", 
            user,
        };
    }
        
    async login(body: any) {
        const { email, password } = body;

        const user = await this.userService.findByEmail(email);

        if(!user) {
            throw new BadRequestException('Invalid Credentials');
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) { 
            throw new BadRequestException('Invalid credential');
        } 


        const token = this.jwtService.sign({
            sub: user._id,
            email: user.email,
        });

        return ({
            message: 'Login Successful',
            access_token: token,
        });
    }

    async changePassword(
        userId: string,
        currentPassword: string,  
        newPassword: string,      
    ) {
        const user = await this.userService.findById(
            userId,
        );

        if(!user) {
            throw new BadRequestException(
                'User not found',
            );
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if(!isPasswordValid) {
            throw new BadRequestException(
                'Current password is invalid'
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.userService.updatePassword(
            userId,
            hashedPassword,
        );

        return {
            message:
            'Password changed successfully'
        };
    }
    
}
