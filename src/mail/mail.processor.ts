import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MailService } from "./mail.service";

@Processor('mail')
export class MailProcessor extends WorkerHost {
    constructor(
        private readonly mailService: MailService
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
        }
    }
}