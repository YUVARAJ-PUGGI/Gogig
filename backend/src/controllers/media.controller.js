import { v4 as uuidv4 } from "uuid";
import Media from "../models/Media.js";

export const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file uploaded"
            });
        }

        const processingId = uuidv4();

        const media = await Media.create({
            processingId,
            originalName: req.file.originalname,
            filePath: req.file.path,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            status: "pending"
        });

        return res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                processingId: media.processingId,
                status: media.status
            }
        });

    } catch (error) {
        console.error("Upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to upload image"
        });
    }
};