import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { BullModule } from "@nestjs/bullmq";
import { MailProcessor } from "./mail.processor";
import { QUEUES } from "./constants/queue.constants";
import { QUEUE_OPTIONS } from "./constants/queue.constants";

@Module({
    imports: [

        BullModule.registerQueue({
            name: QUEUES.MAIL,

            defaultJobOptions: {

            attempts: QUEUE_OPTIONS.ATTEMPTS,

            backoff: {
                type: 'exponential',
                delay: QUEUE_OPTIONS.BACKOFF_DELAY,
            },

            removeOnComplete: QUEUE_OPTIONS.REMOVE_ON_COMPLETE,

            removeOnFail: QUEUE_OPTIONS.REMOVE_ON_FAIL,
        },
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