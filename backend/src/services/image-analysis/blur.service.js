import sharp from "sharp";

const BLUR_THRESHOLD = 100;

export const detectBlur = async (filePath) => {
    const { data, info } = await sharp(filePath)
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    let sum = 0;
    let sumSquared = 0;
    let count = 0;

    for (let y = 1; y < info.height - 1; y++) {
        for (let x = 1; x < info.width - 1; x++) {
            const center = y * info.width + x;

            const laplacian =
                data[center - info.width] +
                data[center - 1] +
                data[center + 1] +
                data[center + info.width] -
                4 * data[center];

            sum += laplacian;
            sumSquared += laplacian * laplacian;
            count++;
        }
    }

    const mean = sum / count;
    const variance = sumSquared / count - mean * mean;

    return {
        isBlurry: variance < BLUR_THRESHOLD,
        score: Number(variance.toFixed(2)),
        threshold: BLUR_THRESHOLD
    };
};