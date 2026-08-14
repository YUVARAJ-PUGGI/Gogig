import "dotenv/config";

import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(
    process.env.REDIS_URL || "redis://127.0.0.1:6379",
    {
        maxRetriesPerRequest: null
    }
);

const mediaQueue = new Queue("media-processing", {
    connection,

    defaultJobOptions: {
        // Retry failed jobs up to 3 times
        attempts: 3,

        // Exponential backoff between retries
        backoff: {
            type: "exponential",
            delay: 2000
        },

        // Keep recent completed jobs for debugging
        removeOnComplete: 100,

        // Keep recent failed jobs for debugging
        removeOnFail: 100
    }
});

export default mediaQueue;