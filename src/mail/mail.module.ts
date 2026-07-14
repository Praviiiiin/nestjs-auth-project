import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { BullModule } from "@nestjs/bullmq";
import { MailProcessor } from "./mail.processor";

@Module({
    imports: [

        BullModule.registerQueue({
            name: 'mail',
        }),
    ],
    providers: [
        MailService,
        {
            provide: 'MAIL_PROVIDER',
            useClass: MailService,
        },
        MailProcessor,
    ],
    exports: [MailService, 'MAIL_PROVIDER'],
})

export class MailModule {}