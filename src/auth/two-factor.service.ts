import { Injectable } from '@nestjs/common';
import { generateSecret } from 'otplib';

@Injectable()
export class TwoFactorService {
    generateSecret(): string {
        return generateSecret();
    }
}