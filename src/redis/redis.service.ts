import {
    Injectable,
    Logger,
    OnModuleDestroy,
} from '@nestjs/common';

import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private readonly redis: Redis;

    constructor(
        private readonly configService: ConfigService,
    ) {
        const host = this.configService.getOrThrow<string>(
            'REDIS_HOST',
        );

        const port = Number(
            this.configService.getOrThrow<string>('REDIS_PORT'),
        );

        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            throw new Error('Invalid REDIS_PORT configuration');
        }

        const password = this.configService.get<string>(
            'REDIS_PASSWORD',
        );

        this.redis = new Redis({
            host,
            port,
            password: password || undefined,
        });

        this.redis.on('connect', () => {
            this.logger.log('Connected to Redis');
        });

        this.redis.on('ready', () => {
            this.logger.log('Redis is ready');
        });

        this.redis.on('error', (error) => {
            this.logger.error(`Redis error: ${error.message}`);
        });

        this.redis.on('close', () => {
            this.logger.warn('Redis connection closed');
        });
    }

    async set(
        key: string,
        value: unknown,
        ttl?: number,
    ): Promise<void> {
        const serializedValue = JSON.stringify(value);

        if (serializedValue === undefined) {
            throw new Error(`Value for Redis key "${key}" is not JSON serializable`);
        }

        if (ttl !== undefined) {
            if (!Number.isFinite(ttl) || ttl <= 0) {
                throw new Error('Redis TTL must be a positive number in milliseconds');
            }

            await this.redis.set(
                key,
                serializedValue,
                'PX',
                ttl,
            );

            return;
        }

        await this.redis.set(key, serializedValue);
    }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.redis.get(key);

        if (value === null) {
            return null;
        }

        try {
            return JSON.parse(value) as T;
        } catch (error) {
            this.logger.warn(
                `Invalid JSON found in Redis key "${key}". Treating it as a cache miss.`,
            );

            try {
                await this.redis.del(key);
    
                return null;
            } catch {
                this.logger.warn(`Could not delete corrupted Redis key"${key}".`)
            }

            return null;
        }
    }

    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async exists(key: string): Promise<boolean> {
        return (await this.redis.exists(key)) === 1;
    }

    async onModuleDestroy(): Promise<void> {
        await this.redis.quit();
        this.logger.log('Redis connection closed gracefully');
    }
}