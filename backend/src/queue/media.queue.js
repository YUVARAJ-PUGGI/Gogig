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

// Redis connection status
connection.on("connect", () => {
    console.log("Redis connecting...");
});

connection.on("ready", () => {
    console.log("Redis connected successfully");
});

connection.on("error", (error) => {
    console.error("Redis connection error:", error.message);
});

// BullMQ queue
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

        // Keep recent completed jobs
        removeOnComplete: 100,

        // Keep recent failed jobs
        removeOnFail: 100
    }
});

export default mediaQueue;