import { IsString, Matches } from 'class-validator';

export class RegenerateRecoveryCodesDto {
    @IsString()
    @Matches(/^\d{6}$/, {
        message: 'Two-factor code must contain exatly 6 digits. '
    })
    twoFactorCode!: string;    
}