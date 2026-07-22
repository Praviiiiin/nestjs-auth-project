import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { BullModule } from '@nestjs/bullmq'
import { BullBoardModule } from './bull-board/bull-board.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
    }),
    
    MongooseModule.forRoot(process.env.MONGODB_URI!),

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(
          process.env.REDIS_PORT,
        ),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        { 
          ttl: 60000,
          limit: 20,
        },
      ],
    }),
    
    AuthModule,
    UsersModule,
    RedisModule,
    BullBoardModule,
  ],
  
}) 
export class AppModule {}


