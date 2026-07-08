import { Injectable } from "@nestjs/common";
import { Redis } from 'ioredis'
import { ConfigService } from '@nestjs/config'


@Injectable()
export class RedisService {

    private readonly redis: Redis;
    constructor(
        private readonly configService: ConfigService
    ) {
        this.redis = new Redis({
            host: this.configService.getOrThrow<string>(
                'REDIS_HOST',
            ),

            port: this.configService.getOrThrow<number>(
                'REDIS_PORT'
            ),

            password: this.configService.get<string>(
                'REDIS_PASSWORD',
            ) || undefined,
        });
    }
}