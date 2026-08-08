import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UploadService {

    constructor(
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async uploadImage(
        file: Express.Multer.File
    ) {
        const result = await this.cloudinaryService.uploadImage(
            file,
        );

        return {
            imageUrl: result.secure_url,
        };
    }
}
