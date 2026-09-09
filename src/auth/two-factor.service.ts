import { Injectable } from '@nestjs/common';
import { generateSecret, generateURI, verify } from 'otplib';

@Injectable()
export class TwoFactorService {
    generateSecret(): string {
        return generateSecret();
    }

    generateOtpAuthUrl(
        email: string,
        secret: string,
    ): string {
        return generateURI({
            issuer: 'NestJS Auth',
            label: email,
            secret,
        });        
    }

    async verifyCode(
        secret: string,
        token: string,
    ): Promise<boolean> {
        const result = await verify({
            secret,
            token,
        });

        return result.valid
    }
    
}