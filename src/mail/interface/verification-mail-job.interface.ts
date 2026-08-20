export interface VerificationMailJob {
    email: string;
    verificationToken: string;
}

export interface PasswordResetMailJob {
    email: string;
    resetToken: string;
}