import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports : [
    CloudinaryModule,
    UsersModule
  ],

  controllers: [
    UploadController
  ],

  providers: [
    UploadService
  ],
  
})
export class UploadModule {}
