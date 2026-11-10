import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';

import { RedisService } from './redis.service';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
    constructor(
        private readonly redisService: RedisService,
    ) {}

    async increment(
        key: string,
        ttl: number,
        limit: number,
        blockDuration: number,
        throttlerName: string,
     ) {

        const prefix = `throttler:${throttlerName}:${key}`;

        return this.redisService.incrementRateLimit(
            `${prefix}:hits`,
            `${prefix}:blocked`,
            ttl,
            limit,
            blockDuration,
        );
    }
}