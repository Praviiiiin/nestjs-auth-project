import { Controller, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';

@Controller('upload')
export class UploadController {

    @Post()
    @UseInterceptors(
        FileInterceptor('file')
    )
    
    uploadFile(
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
        return file;
    }
}
