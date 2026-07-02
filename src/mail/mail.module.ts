import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MockMailService } from "./mock-mail.service";

@Module({
    providers: [
        MailService,
        MockMailService,

        {
            provide: 'MAIL_PROVIDER',
            useClass: MailService
        }
    ],
    
    exports: [MailService],
})

export class MailModule {}