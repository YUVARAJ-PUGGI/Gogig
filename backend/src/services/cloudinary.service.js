import cloudinary from "../config/cloudinary.js";

export const uploadImageToCloudinary = (buffer, originalName) => {
    return new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "gogig/media",
                resource_type: "image",
                public_id: `${Date.now()}-${originalName
                    .replace(/\.[^/.]+$/, "")
                    .replace(/[^a-zA-Z0-9-_]/g, "-")}`
            },

            (error, result) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(buffer);
    });
};