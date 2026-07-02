import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Module({
    providers: [
        MailService,
        {
            provide: 'MAIL_PROVIDER',
            useClass: MailService,
        },
    ],
    exports: [MailService, 'MAIL_PROVIDER'],
})

export class MailModule {}