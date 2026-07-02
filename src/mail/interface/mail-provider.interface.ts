export interface MailProvider{
    
    sendVerificationEmail(
        email: string,
        token: string,
    ): Promise<void>;

    sendResetPasswordEmail(
        email: string,
        token: string,
    ): Promise<void>;
}