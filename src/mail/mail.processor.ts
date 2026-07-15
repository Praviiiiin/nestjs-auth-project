import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MailService } from "./mail.service";
import { Logger } from "@nestjs/common";

@Processor('mail')
export class MailProcessor extends WorkerHost {

    private readonly logger = new Logger(
            MailProcessor.name,
    );

    constructor(
        private readonly mailService: MailService,
    ) {
        super()
    }

    async process(job: Job){

        switch(job.name) {

            case 'send-verification-email':

                await this.mailService.sendVerificationEmail(
                    job.data.email,
                    job.data.token,
                );

                break;

            case 'send-reset-password-email':

                await this.mailService.sendResetPasswordEmail(
                    job.data.email,
                    job.data.token,
                );

                break;

            default:

                throw new Error(
                    `Unknown job: ${job.name}`,
                );
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(
            `Job ${job.name} completed`,
        )
    }

    @OnWorkerEvent('failed')
    onFailed(
        job: Job,
        error: Error,
    ) {
        this.logger.log(
            `Job ${job?.name} failed`,
            error.stack,
        )
    }

    @OnWorkerEvent('active')
    onActive(job: Job) {
        this.logger.log(
            `Processing ${job.name}`
        );
        
    }
}