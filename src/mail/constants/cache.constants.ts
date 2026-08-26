export const CACHE_KEYS = {
    USER: (id: string) => `user:{id}`,
} as const;

export const CACHE = {
    USER_TTL: 60000,
} as const;