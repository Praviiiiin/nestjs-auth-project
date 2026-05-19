import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService  } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
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
}
