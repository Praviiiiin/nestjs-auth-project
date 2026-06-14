import { isEmpty, IsNotEmpty } from "class-validator";

export class RefreshTokenDto {
    @IsNotEmpty()
    refreshToken!: string;
}