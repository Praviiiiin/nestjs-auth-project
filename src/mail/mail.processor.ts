import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MailService } from "./mail.service";
import { Logger } from "@nestjs/common";
import { VerificationMailJob } from "./interface/verification-mail-job.interface";
import { ResetPasswordMailJob } from "./interface/reset-password-mail-job.interface";
import { QUEUES } from "./constants/queue.constants";
import { MAIL_JOBS } from "./constants/job.constants";

@Processor(QUEUES.MAIL)
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

            case MAIL_JOBS.SEND_VERIFICATION: {
                const data = job.data as VerificationMailJob;

                await this.mailService.sendVerificationEmail(
                    data.email,
                    data.verificationToken,
                );

                break;
            }

            case MAIL_JOBS.SEND_RESET_PASSWORD: {
                const data = job.data as ResetPasswordMailJob
            

                await this.mailService.sendResetPasswordEmail(
                    data.email,
                    data.resetPasswordToken,
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
        this.logger.error(
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