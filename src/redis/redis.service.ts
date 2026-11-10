import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'crypto';
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
    if (!Number.isFinite(ttl) || ttl <= 0) {
        throw new Error('Rate limit TTL must be positive');
    }

    if (!Number.isInteger(limit) || limit < 1) {
        throw new Error('Rate limit must be a positive integer');
    }

    if (!Number.isFinite(blockDuration) || blockDuration <= 0) {
        throw new Error('Block duration must be positive');
    }

    const now = Date.now();
    const requestId = `${now}:${randomUUID()}`;

    const script = `
        local now = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local limit = tonumber(ARGV[3])
        local blockDuration = tonumber(ARGV[4])
        local requestId = ARGV[5]

        -- Check whether this tracker is already blocked.
        local blockedHits = redis.call('GET', KEYS[2])

        if blockedHits then
            local blockTTL = redis.call('PTTL', KEYS[2])

            return {
                tonumber(blockedHits),
                0,
                1,
                math.ceil(blockTTL / 1000)
            }
        end

        -- Remove requests outside the sliding window.
        local cutoff = now - window
        redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', cutoff)

        -- Record this request.
        redis.call('ZADD', KEYS[1], now, requestId)
        redis.call('PEXPIRE', KEYS[1], window)

        local totalHits = redis.call('ZCARD', KEYS[1])

        -- Calculate when the oldest request expires.
        local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
        local timeToExpire = 0

        if #oldest > 0 then
            timeToExpire = math.ceil(
                (tonumber(oldest[2]) + window - now) / 1000
            )
        end

        -- Block when the request count exceeds the limit.
        if totalHits > limit then
            redis.call(
                'SET',
                KEYS[2],
                totalHits,
                'PX',
                blockDuration
            )

            -- Clear the old window. A request after the block
            -- expires starts a fresh counting window.
            redis.call('DEL', KEYS[1])

            return {
                totalHits,
                timeToExpire,
                1,
                math.ceil(blockDuration / 1000)
            }
        end

        return {
            totalHits,
            timeToExpire,
            0,
            0
        }
    `;

    const result = await this.redis.eval(
        script,
        2,
        counterKey,
        blockKey,
        String(now),
        String(ttl),
        String(limit),
        String(blockDuration),
        requestId,
    ) as number[];

    return {
        totalHits: Number(result[0]),
        timeToExpire: Number(result[1]),
        isBlocked: Number(result[2]) === 1,
        timeToBlockExpire: Number(result[3]),
    };
}

    

}