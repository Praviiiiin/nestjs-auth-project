import {Injectable, Logger, InternalServerErrorException} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {

    private readonly logger =
        new Logger(
            MailService.name,
        );

    private transporter =
        nodemailer.createTransport({
            service: 'gmail',

            auth: {
                user:
                    process.env.MAIL_USER,

                pass:
                    process.env.MAIL_PASS,
            },
        });

    async sendVerificationEmail(
        email: string,
        token: string,
    ) {

        const verificationUrl =
            `http://localhost:3001/auth/verify-email?token=${token}`;

        try {

            await this.transporter.sendMail({
                from:
                    process.env.MAIL_USER,

                to: email,

                subject:
                    'Verify Your Email',

                html: `
                    <h2>Welcome to NestJS Auth</h2>

                    <p>
                        Click the button below
                        to verify your email.
                    </p>

                    <a href="${verificationUrl}">
                        Verify Email
                    </a>
                `,
            });

            this.logger.log(
                `Verification email sent to ${email}`,
            );

        } catch (error: any) {

            this.logger.error(
                'Failed to send verification email',
                error.stack,
            );

            throw new InternalServerErrorException(
                'Unable to send verification email.',
            );
        }
    }

    async sendResetPasswordEmail(
        email: string,
        token: string,
    ) {

        const resetUrl =
            `http://localhost:3001/auth/reset-password?token=${token}`;

        try {

            await this.transporter.sendMail({
                from:
                    process.env.MAIL_USER,

                to: email,

                subject:
                    'Reset Your Password',

                html: `
                    <h2>Password Reset</h2>

                    <p>
                        Click the button below
                        to reset your password.
                    </p>

                    <a href="${resetUrl}">
                        Reset Password
                    </a>
                `,
            });

            this.logger.log(
                `Password reset email sent to ${email}`,
            );

        } catch (error: any) {

            this.logger.error(
                'Failed to send password reset email',
                error.stack,
            );

            throw new InternalServerErrorException(
                'Unable to send password reset email.',
            );
        }
    }
}