import { Controller, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserDocument } from 'src/users/schemas/user.schema';

@Controller('upload')
export class UploadController {

    constructor(
        private readonly uploadService: UploadService
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('file')
    )
    
    uploadFile(

        @CurrentUser()
        user: UserDocument,
        
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({

                        maxSize: 2 * 1024 * 1024,
                    }),

                    new FileTypeValidator({
                        fileType: /(jpg|jpeg|png)$/,
                    }),
                ],
            }),
        )
        file: Express.Multer.File
    ) {
        return this.uploadService.uploadImage(
            file,
            user._id.toString()
        );
    }
}
