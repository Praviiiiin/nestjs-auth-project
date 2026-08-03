import { Module, MiddlewareConsumer, NestModule, NotImplementedException } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { BullModule } from '@nestjs/bullmq'
import { BullBoardModule } from './bull-board/bull-board.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { THROTTLER } from './mail/constants/throttler.constants';
import { APP_GUARD } from '@nestjs/core';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UploadModule } from './upload/upload.module';


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
          ttl: THROTTLER.GLOBAL.TTL,
          limit: THROTTLER.GLOBAL.LIMIT,
        },
      ],
    }),

    AuthModule,
    UsersModule,
    RedisModule,
    BullBoardModule,
    UploadModule,
  ],
  
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
}) 

export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}


