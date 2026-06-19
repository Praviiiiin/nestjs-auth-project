import { IsOptional, IsNumberString, IsNumber, IsString } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsNumberString()
    page?: string;

    @IsOptional()
    @IsNumberString()
    limit?: string;

    @IsOptional()
    @IsString()
    search?: string;
}