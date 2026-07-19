import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MailService } from "./mail.service";
import { Logger } from "@nestjs/common";
import { VerificationMailJob } from "./interface/verification-mail-job.interface";
import { ResetPasswordMailJob } from "./interface/reset-password-mail-job.interface";

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

            case 'send-verification-email': {
                const data = job.data as VerificationMailJob;

                await this.mailService.sendVerificationEmail(
                    job.data.email,
                    job.data.verificationToken,
                );

                break;
            }

            case 'send-reset-password-email': {
                const data = job.data as ResetPasswordMailJob
            

                await this.mailService.sendResetPasswordEmail(
                    job.data.email,
                    job.data.resetPasswordToken,
                );

                break;
            }    
            default:

                this.logger.error(
                    `Unknown job recieved: ${job.name}`,
                );

                throw new Error(
                    `Unknown job: ${job.name}`,
                );
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(
            `Job "${job.name}" completed successfully (ID: ${job.id})`,
        )
    }

    @OnWorkerEvent('failed')
    onFailed(
        job: Job,
        error: Error,
    ) {
        this.logger.log(
            `Job "${job?.name}" failed (ID: ${job?.id})`,
            error.stack,
        )
    }

    @OnWorkerEvent('active')
    onActive(job: Job) {
        this.logger.log(
            `Processing job "${job.name}" (ID: ${job.id})`,
        );
        
    }
}