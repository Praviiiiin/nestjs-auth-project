import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';

@Controller('upload')
export class UploadController {

    @Post()
    @UseInterceptors(
        FileInterceptor('file')
    )
    
    uploadFile(
        @UploadedFile()
        file: Express.Multer.File
    ) {
        return file;
    }
}
