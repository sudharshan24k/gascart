import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create a singleton Redis instance
const redis = new Redis(redisUrl, {
    lazyConnect: true, // Don't connect until needed
    enableOfflineQueue: false, // Don't queue commands if disconnected
    maxRetriesPerRequest: 0, // Fail fast if a command is sent while reconnecting
    retryStrategy: (times) => {
        if (times > 3) {
            console.warn('[Redis] Max retries reached, stopping background reconnection attempts.');
            return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redis.on('error', (err: any) => {
    if (process.env.NODE_ENV !== 'test') { // Supress error logs in test
        if (err.code !== 'ECONNREFUSED') {
            console.warn('[Redis] connection error:', err.message);
        }
    }
});

export default redis;
