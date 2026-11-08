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

    async incrementRateLimit(
    counterKey: string,
    blockKey: string,
    ttl: number,
    limit: number,
    blockDuration: number,
): Promise<{
    totalHits: number;
    timeToExpire: number;
    isBlocked: boolean;
    timeToBlockExpire: number;
}> {
    const script = `
        local blockTTL = redis.call('PTTL', KEYS[2])
        local currentHits = tonumber(redis.call('GET', KEYS[1]) or '0')
        local counterTTL = redis.call('PTTL', KEYS[1])

        -- Client is already blocked
        if blockTTL > 0 then
            return {
                currentHits,
                math.max(counterTTL, 0),
                1,
                blockTTL
            }
        end

        -- Increment counter atomically
        local hits = redis.call('INCR', KEYS[1])

        -- Set expiration on first request
        if hits == 1 then
            redis.call('PEXPIRE', KEYS[1], ARGV[1])
        end

        local timeToExpire = redis.call('PTTL', KEYS[1])

        -- Block when request limit is exceeded
        if hits > tonumber(ARGV[2]) then
            redis.call('SET', KEYS[2], '1', 'PX', ARGV[3])

            -- Reset the counter when the block expires
            redis.call('PEXPIRE', KEYS[1], ARGV[3])

            return {
                hits,
                tonumber(ARGV[3]),
                1,
                tonumber(ARGV[3])
            }
        end

        return {
            hits,
            math.max(timeToExpire, 0),
            0,
            0
        }
    `;

    const result = await this.redis.eval(
        script,
        2,
        counterKey,
        blockKey,
        String(ttl),
        String(limit),
        String(blockDuration),
    ) as number[];

    return {
        totalHits: Number(result[0]),
        timeToExpire: Number(result[1]),
        isBlocked: Number(result[2]) === 1,
        timeToBlockExpire: Number(result[3]),
    };
}
}