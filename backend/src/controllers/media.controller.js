import { v4 as uuidv4 } from "uuid";

import Media from "../models/Media.js";

import mediaQueue from "../queue/media.queue.js";

import {
    uploadImageToCloudinary
} from "../services/cloudinary.service.js";



/*
 * Upload image
 */
export const uploadMedia = async (req, res) => {

    try {

        // -----------------------------------------
        // 1. Check uploaded file
        // -----------------------------------------

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "No image file uploaded"

            });

        }



        // -----------------------------------------
        // 2. Generate unique processing ID
        // -----------------------------------------

        const processingId =
            uuidv4();



        // -----------------------------------------
        // 3. Upload image to Cloudinary
        // -----------------------------------------

        const cloudinaryResult =
            await uploadImageToCloudinary(
                req.file.buffer,
                req.file.originalname
            );



        console.log(
            "Cloudinary upload successful:",
            cloudinaryResult.secure_url
        );



        // -----------------------------------------
        // 4. Store metadata in MongoDB
        // -----------------------------------------

        const media =
            await Media.create({

                processingId,

                originalName:
                    req.file.originalname,

                filePath:
                    cloudinaryResult.secure_url,

                cloudinaryPublicId:
                    cloudinaryResult.public_id,

                mimeType:
                    req.file.mimetype,

                fileSize:
                    req.file.size,

                status:
                    "pending"

            });



        // -----------------------------------------
        // 5. Add job to BullMQ
        // -----------------------------------------

        await mediaQueue.add(
            "process-media",
            {

                processingId:
                    media.processingId,

                filePath:
                    media.filePath

            }
        );



        // -----------------------------------------
        // 6. Return immediately
        // -----------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Image uploaded successfully",

            data: {

                processingId:
                    media.processingId,

                status:
                    media.status,

                cloudinaryUrl:
                    media.filePath

            }

        });



    } catch (error) {

        console.error(
            "Upload error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to upload image"

        });

    }

};




/*
 * Get media processing status
 * and analysis results
 */
export const getMediaStatus = async (req, res) => {

    try {

        const {
            processingId
        } = req.params;



        // -----------------------------------------
        // Find media record
        // -----------------------------------------

        const media =
            await Media.findOne({
                processingId
            });



        // -----------------------------------------
        // Processing ID not found
        // -----------------------------------------

        if (!media) {

            return res.status(404).json({

                success: false,

                message:
                    "Media processing record not found"

            });

        }



        // -----------------------------------------
        // Return processing information
        // -----------------------------------------

        return res.status(200).json({

            success: true,

            data: {

                processingId:
                    media.processingId,

                originalName:
                    media.originalName,

                mimeType:
                    media.mimeType,

                fileSize:
                    media.fileSize,

                cloudinaryUrl:
                    media.filePath,

                status:
                    media.status,

                analysisResults:
                    media.analysisResults,

                error:
                    media.error,

                createdAt:
                    media.createdAt,

                updatedAt:
                    media.updatedAt

            }

        });



    } catch (error) {

        console.error(
            "Get media status error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch media processing status"

        });

    }

};