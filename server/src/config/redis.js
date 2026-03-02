import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL, {
    // Upstash usually requires TLS for security
    tls: {
        rejectUnauthorized: false // Helps avoid local cert issues with cloud providers
    },
    // Upstash is serverless, so we don't want the client to hang indefinitely
    maxRetriesPerRequest: 0, 
    
    // retryStrategy: Upstash handles the connection, so a simple backoff is fine
    retryStrategy(times) {
        if (times > 3) {
            console.error("❌ Upstash connection failed after 3 attempts.");
            return null; // Stop retrying to avoid billing/request spikes
        }
        return Math.min(times * 200, 1000);
    },
});

redis.on('connect', () => {
    console.log('🚀 Upstash Redis Connected: Ludo Neo State Engine Ready');
});

redis.on('error', (err) => {
    console.error('❌ Upstash Error:', err.message);
});

export { redis };