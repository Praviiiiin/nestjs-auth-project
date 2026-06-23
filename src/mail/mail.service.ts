import { Injectable } from "@nestjs/common";
import { log } from "node:console";
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
    async sendVerificationEmail(
        email: string,
        token: string,
    ) {
        console.log('Sending email to: ', email);
        console.log('Verification token: ', token);;        
    }
}