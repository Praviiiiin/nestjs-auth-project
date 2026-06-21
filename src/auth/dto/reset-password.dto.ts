import { IsString, Min, MinLength } from "class-validator";

export class ResetPasswordDto {
    @IsString()
    token!: string;

    @MinLength(6)
    newPassword!: string;
}