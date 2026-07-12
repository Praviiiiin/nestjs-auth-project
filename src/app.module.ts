import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { BullModule } from '@nestjs/bullmq'

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
    
    AuthModule,
    UsersModule,
    RedisModule,
  ],
  
}) 
export class AppModule {}


