import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        processingId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        originalName: {
            type: String,
            required: true
        },

        filePath: {
            type: String,
            required: true
        },

        mimeType: {
            type: String,
            required: true
        },

        fileSize: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
            index: true
        },

        analysisResults: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        error: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Media = mongoose.model("Media", mediaSchema);

export default Media;