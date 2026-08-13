import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import Media from "../models/Media.js";
import connectDB from "../config/db.js";

import {
    generateImageHash,
    generatePerceptualHash
} from "../services/image-analysis/duplicate.service.js";

import {
    detectDuplicate
} from "../services/image-analysis/duplicate-detection.service.js";


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


        try {

            // 1. Mark media as processing

            await Media.findOneAndUpdate(
                { processingId },
                {
                    status: "processing"
                }
            );


            // 2. Generate SHA-256 hash

            const sha256Hash = generateImageHash(filePath);


            // 3. Generate perceptual hash

            const perceptualHash =
                await generatePerceptualHash(filePath);


            console.log("SHA-256:", sha256Hash);
            console.log("pHash:", perceptualHash);
            console.log("pHash length:", perceptualHash.length);


            // 4. Detect duplicate

            const duplicateResult = await detectDuplicate({
                processingId,
                sha256Hash,
                perceptualHash
            });


            console.log(
                "Duplicate result:",
                duplicateResult
            );


            // 5. Save hashes + duplicate result

            await Media.findOneAndUpdate(
                { processingId },
                {
                    sha256Hash,
                    perceptualHash,

                    status: "completed",

                    analysisResults: {
                        message: "Processing completed",

                        duplicate: duplicateResult
                    }
                }
            );


            console.log(
                "Completed job:",
                processingId
            );


        } catch (error) {

            // 6. Mark media as failed

            await Media.findOneAndUpdate(
                { processingId },
                {
                    status: "failed",

                    analysisResults: {
                        message: "Processing failed",
                        error: error.message
                    }
                }
            );


            console.error(
                "Processing failed:",
                processingId,
                error.message
            );


            // Tell BullMQ that the job failed

            throw error;
        }
    },


    {
        connection
    }
);


// Worker completed event

worker.on("completed", (job) => {

    console.log(
        `Job ${job.id} completed`
    );

});


// Worker failed event

worker.on("failed", (job, error) => {

    console.error(
        `Job ${job?.id} failed:`,
        error.message
    );

});


console.log("Media worker started...");