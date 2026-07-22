export const THROTTLER = {
    GLOBAL: {
        TTL: 60000,
        LIMIT: 20,
    },

    LOGIN: {
        TTL: 60000,
        LIMIT: 5,
    },

    REGISTER: {
        TTL: 60 * 60 * 1000,
        LIMIT: 10,
    },

    FORGOT_PASSWORD: {
        TTL: 60 * 60 * 1000,
        LIMIT: 3,
    },

    RESET_PASSWORD: {
        TTL: 60 * 60 * 1000,
        LIMIT: 3,
    },

    RESEND_VERIFICATION: {
        TTL: 60 * 60 * 1000,
        LIMIT: 3,
    }
} as const;