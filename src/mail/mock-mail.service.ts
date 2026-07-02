import { Injectable } from "@nestjs/common";
import { MailProvider } from "./interface/mail-provider.interface";


@Injectable()
export class MockMailService implements MailProvider{
    async sendVerificationEmail(
        email: string,
        token: string
    ) {
        console.log('[MOCK] Verification Email');
        console.log(email);
        console.log(token);
    }

    async sendResetPasswordEmail(
        email: string, 
        token: string
    ) {
        console.log('[MOCK] Reset Password');
        console.log(email);
        console.log(token);
        
    }            
}