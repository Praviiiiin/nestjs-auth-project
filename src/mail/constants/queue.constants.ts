export const QUEUES = {
    MAIL: 'mail',
} as const;

export const QUEUE_OPTIONS = {
    ATTEMPTS: 3,

    BACKOFF_DELAY: 5000,

    REMOVE_ON_COMPLETE: true,

    REMOVE_ON_FAIL: false,    
} as const 