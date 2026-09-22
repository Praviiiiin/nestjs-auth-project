import { IsEmail, IsString, MinLength, IsOptional, Length } from "class-validator";

export class LoginDto {
    @IsEmail()
    email!: string;

    @MinLength(6)
    password!: string;

    @IsOptional()
    @IsString()
    @Length(6, 6)
    twoFactorCode?: string;
}