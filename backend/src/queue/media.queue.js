import "dotenv/config";

import { Queue } from "bullmq";
import IORedis from "ioredis";

console.log(
    "REDIS_URL status:",
    process.env.REDIS_URL ? "SET" : "MISSING"
);

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});

const mediaQueue = new Queue("media-processing", {
    connection,

    defaultJobOptions: {
        attempts: 3,

        backoff: {
            type: "exponential",
            delay: 2000
        },

        removeOnComplete: 100,
        removeOnFail: 100
    }
});

export default mediaQueue;