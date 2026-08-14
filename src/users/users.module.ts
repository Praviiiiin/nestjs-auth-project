import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from './user.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from "./schemas/user.schema"
import { RedisModule } from 'src/redis/redis.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports : [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
    ]),

    RedisModule,
    CloudinaryModule,
  ],
  controllers: [
    UsersController,
  ],
  providers: [UsersService],
  exports: [UsersService], 
})

export class UsersModule {}
