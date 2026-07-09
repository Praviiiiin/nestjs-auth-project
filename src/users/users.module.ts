import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from './user.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from "./schemas/user.schema"
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports : [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
    ]),

    RedisModule
  ],
  controllers: [
    UsersController,
  ],
  providers: [UsersService],
  exports: [UsersService], 
})

export class UsersModule {}
