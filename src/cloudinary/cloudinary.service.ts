import { Inject, Injectable } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary'
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {

    constructor(

        @Inject('CLOUDINARY')
        private readonly cloudinary: typeof Cloudinary
    ) {}

    async uploadImage(
        file: Express.Multer.File,
        userId: string,
    ): Promise<UploadApiResponse> {

        return new Promise(
            (resolve, reject) => {

                const upload = this.cloudinary.uploader.upload_stream(
                    {
                        folder: 'NestJS Authentication/avatars',
                        resource_type: 'image',
                    },
                    (error, result) => {

                        if (error) {
                            return reject(error);
                        }

                        if (!result) {
                            return reject(new Error('Upload failed: no result returned'));
                        }

                        resolve(result);
                    },
                );

                Readable.from(
                    file.buffer,
                ).pipe(upload)
            },
        );
    }

    async deleteImage(
        publicId: string
    ): Promise <void> {

        await this.cloudinary.uploader.destroy(
            publicId,
        );
    }
}
