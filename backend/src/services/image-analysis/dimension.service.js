import sharp from "sharp";

const MIN_PIXEL_COUNT = 640 * 480;

export const detectDimensions = async (filePath) => {
    const metadata = await sharp(filePath).metadata();

    const width = metadata.width || 0;
    const height = metadata.height || 0;

    const pixelCount = width * height;

    const isValid = pixelCount >= MIN_PIXEL_COUNT;

    return {
        isValid,
        width,
        height,
        pixelCount,
        minimumPixelCount: MIN_PIXEL_COUNT
    };
};