import { Injectable, Logger } from "@nestjs/common";
import { Redis } from 'ioredis'
import { ConfigService } from '@nestjs/config'


@Injectable()
export class RedisService {

    private readonly logger = new Logger(RedisService.name);
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

        this.redis.on('connect', () => {
            this.logger.log('Connected to Redis');
        });

        this.redis.on('error', (error) => {
            this.logger.error(error.message)
        })
    }

    async set(
        key: string,
        value: unknown,
        ttl?: number,
    ) {
        if(ttl) {
            await this.redis.set(
                key,
                JSON.stringify(value),
                'PX',
                ttl,
            );

            return;
        }
        await this.redis.set(
            key,
            JSON.stringify(value)
        );
    }
}