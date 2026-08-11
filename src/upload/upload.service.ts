import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UploadService {

    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly usersService: UsersService,
    ) {}

    async uploadImage(
        file: Express.Multer.File,
        userId: string,
    ) {
        const result = await this.cloudinaryService.uploadImage(
            file,
        );

        const updatedUser = await this.usersService.updateAvatar(
            userId,
            result.secure_url,
            result.public_id,
        );

        return  {
            message: 'Avatar updated successfully',
            user: updatedUser
        };
    }
}
