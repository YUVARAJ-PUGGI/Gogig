import "dotenv/config";

import { Worker } from "bullmq";

import IORedis from "ioredis";

import fs from "fs/promises";

import path from "path";

import os from "os";

import crypto from "crypto";


import Media from "../models/Media.js";

import connectDB from "../config/db.js";


import {
    generateImageHash,
    generatePerceptualHash
} from "../services/image-analysis/duplicate.service.js";


import {
    detectDuplicate
} from "../services/image-analysis/duplicate-detection.service.js";


import {
    detectBlur
} from "../services/image-analysis/blur.service.js";


import {
    detectBrightness
} from "../services/image-analysis/brightness.service.js";


import {
    detectDimensions
} from "../services/image-analysis/dimension.service.js";



const connection = new IORedis({

    host: "127.0.0.1",

    port: 6379,

    maxRetriesPerRequest: null

});



await connectDB();




/*
 * Download Cloudinary image to a temporary file
 */
const downloadImageToTempFile = async (imageUrl) => {

    const response =
        await fetch(imageUrl);


    if (!response.ok) {

        throw new Error(
            `Failed to download image: ${response.status} ${response.statusText}`
        );

    }


    const buffer =
        Buffer.from(
            await response.arrayBuffer()
        );


    const extension =
        path.extname(
            new URL(imageUrl).pathname
        ) || ".jpg";


    const tempFileName =
        `gogig-${crypto.randomUUID()}${extension}`;


    const tempFilePath =
        path.join(
            os.tmpdir(),
            tempFileName
        );


    await fs.writeFile(
        tempFilePath,
        buffer
    );


    return tempFilePath;

};




const worker = new Worker(

    "media-processing",


    async (job) => {

        const {
            processingId,
            filePath
        } = job.data;


        const currentAttempt =
            job.attemptsMade + 1;


        const maxAttempts =
            job.opts.attempts || 1;


        let temporaryFilePath = null;



        console.log(
            "================================"
        );


        console.log(
            "Processing job:",
            processingId
        );


        console.log(
            "Cloudinary URL:",
            filePath
        );


        console.log(
            `Attempt: ${currentAttempt}/${maxAttempts}`
        );


        console.log(
            "================================"
        );



        try {

            // -----------------------------------------
            // 1. Mark media as processing
            // -----------------------------------------

            await Media.findOneAndUpdate(

                {
                    processingId
                },

                {
                    status: "processing"
                }

            );



            // -----------------------------------------
            // 2. Download image temporarily
            // -----------------------------------------

            if (
                filePath.startsWith("http://") ||
                filePath.startsWith("https://")
            ) {

                temporaryFilePath =
                    await downloadImageToTempFile(
                        filePath
                    );

            } else {

                // Backward compatibility for old
                // local test records.

                temporaryFilePath =
                    filePath;

            }


            console.log(
                "Temporary file:",
                temporaryFilePath
            );



            // -----------------------------------------
            // 3. Generate SHA-256 hash
            // -----------------------------------------

            const sha256Hash =
                generateImageHash(
                    temporaryFilePath
                );


            console.log(
                "SHA-256:",
                sha256Hash
            );



            // -----------------------------------------
            // 4. Generate perceptual hash
            // -----------------------------------------

            const perceptualHash =
                await generatePerceptualHash(
                    temporaryFilePath
                );


            console.log(
                "pHash:",
                perceptualHash
            );


            console.log(
                "pHash length:",
                perceptualHash.length
            );



            // -----------------------------------------
            // 5. Duplicate detection
            // -----------------------------------------

            const duplicateResult =
                await detectDuplicate({

                    processingId,

                    sha256Hash,

                    perceptualHash

                });


            console.log(
                "Duplicate result:",
                duplicateResult
            );



            // -----------------------------------------
            // 6. Blur detection
            // -----------------------------------------

            const blurResult =
                await detectBlur(
                    temporaryFilePath
                );


            console.log(
                "Blur result:",
                blurResult
            );



            // -----------------------------------------
            // 7. Brightness detection
            // -----------------------------------------

            const brightnessResult =
                await detectBrightness(
                    temporaryFilePath
                );


            console.log(
                "Brightness result:",
                brightnessResult
            );



            // -----------------------------------------
            // 8. Dimension validation
            // -----------------------------------------

            const dimensionsResult =
                await detectDimensions(
                    temporaryFilePath
                );


            console.log(
                "Dimensions result:",
                dimensionsResult
            );



            // -----------------------------------------
            // 9. Save analysis results
            // -----------------------------------------

            await Media.findOneAndUpdate(

                {
                    processingId
                },

                {

                    sha256Hash,

                    perceptualHash,

                    status:
                        "completed",

                    analysisResults: {

                        message:
                            "Processing completed",

                        duplicate:
                            duplicateResult,

                        blur:
                            blurResult,

                        brightness:
                            brightnessResult,

                        dimensions:
                            dimensionsResult

                    }

                }

            );



            console.log(
                "================================"
            );


            console.log(
                "Completed job:",
                processingId
            );


            console.log(
                "================================"
            );



        } catch (error) {


            const failedAttempt =
                job.attemptsMade + 1;


            const totalAttempts =
                job.opts.attempts || 1;


            const isFinalAttempt =
                failedAttempt >= totalAttempts;



            console.error(
                `Processing failed - attempt ${failedAttempt}/${totalAttempts}`
            );


            console.error(
                "Processing ID:",
                processingId
            );


            console.error(
                "Error:",
                error.message
            );



            if (isFinalAttempt) {


                await Media.findOneAndUpdate(

                    {
                        processingId
                    },

                    {

                        status:
                            "failed",

                        analysisResults: {

                            message:
                                "Processing failed after all retry attempts",

                            error:
                                error.message,

                            attempts:
                                failedAttempt

                        }

                    }

                );


                console.error(
                    "Job permanently failed:",
                    processingId
                );



            } else {


                await Media.findOneAndUpdate(

                    {
                        processingId
                    },

                    {

                        status:
                            "processing",

                        analysisResults: {

                            message:
                                `Processing failed. Retrying attempt ${failedAttempt + 1}/${totalAttempts}`,

                            error:
                                error.message,

                            attempts:
                                failedAttempt

                        }

                    }

                );


                console.log(
                    `Retry scheduled: attempt ${failedAttempt + 1}/${totalAttempts}`
                );

            }



            // Tell BullMQ the job failed.

            throw error;



        } finally {


            // -----------------------------------------
            // Delete temporary downloaded file
            // -----------------------------------------

            if (
                temporaryFilePath &&
                temporaryFilePath !== filePath
            ) {

                try {

                    await fs.unlink(
                        temporaryFilePath
                    );


                    console.log(
                        "Temporary file deleted:",
                        temporaryFilePath
                    );


                } catch (cleanupError) {

                    console.error(
                        "Failed to delete temporary file:",
                        cleanupError.message
                    );

                }

            }

        }

    },


    {
        connection
    }

);




worker.on(
    "completed",
    (job) => {

        console.log(
            `Job ${job.id} completed`
        );

    }
);




worker.on(
    "failed",
    (job, error) => {

        console.error(
            `Job ${job?.id} failed:`,
            error.message
        );

    }
);




console.log(
    "Media worker started..."
);