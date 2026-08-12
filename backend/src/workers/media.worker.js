import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import Media from "../models/Media.js";
import connectDB from "../config/db.js";

const connection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null
});

await connectDB();

const worker = new Worker(
    "media-processing",
    async (job) => {
        const { processingId, filePath } = job.data;

        console.log("Processing job:", processingId);
        console.log("File:", filePath);

        await Media.findOneAndUpdate(
            { processingId },
            { status: "processing" }
        );

        // Image analysis will be added here later.

        await Media.findOneAndUpdate(
            { processingId },
            {
                status: "completed",
                analysisResults: {
                    message: "Processing completed"
                }
            }
        );

        console.log("Completed job:", processingId);
    },
    {
        connection
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
});

console.log("Media worker started...");