import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
    private readonly logger = new Logger(
        MailService.name
    );

    private transporter = nodemailer.createTransport({
        service: 'gmail',

        auth: {
            user: process.env.MAIL_USER,

            pass: process.env.MAIL_PASS,
        },
    });

    async sendVerificationEmail(
        email: string,
        token: string,
    ) {
        const verificationUrl = `http://localhost:3001/auth/verify-email?token=${token}`;
        
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_USER,
                to: email,
    
                subject: 'Verify your email',
    
                html: `<h2> Welcome to NestJS Auth </h2>
                       <p> Click the link below to verify your account. </p>
                       <a href = '${verificationUrl}'>
                            Verify Email
                        </a>
                        `,
            });
    
            this.logger.log(`Verification email sent to ${email}`);
    
        } catch (error) {
            this.logger.error(
                'Failed to send verification email',
                error instanceof Error ? error.stack : String(error),
            );

            throw new Error(
                'Unable to send verification email'
            );
        }    
    }

    async sendResetPasswordEmail(
        email: string,
        token: string,
    ) {
        const resetUrl = `http://localhost:3001/auth/reset-password?token=${token}`;

        await this.transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,

            subject: 'Reset Your Password',

            html: `<h2>Password Reset</h2>
            <p>
                Click the button below to reset your password.
            </p>

            <a href="${resetUrl}">
                Reset Password
            </a>
        `,
    });

    console.log('Password reset email sent to:', email);
    }
}