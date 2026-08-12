import sharp from "sharp";

const DARK_THRESHOLD = 60;
const BRIGHT_THRESHOLD = 200;

export const detectBrightness = async (filePath) => {
    const { data, info } = await sharp(filePath)
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    let totalBrightness = 0;

    for (const pixel of data) {
        totalBrightness += pixel;
    }

    const meanBrightness = totalBrightness / data.length;

    let level;

    if (meanBrightness < DARK_THRESHOLD) {
        level = "dark";
    } else if (meanBrightness > BRIGHT_THRESHOLD) {
        level = "bright";
    } else {
        level = "normal";
    }

    return {
        meanBrightness: Number(meanBrightness.toFixed(2)),
        level,
        thresholds: {
            dark: DARK_THRESHOLD,
            bright: BRIGHT_THRESHOLD
        }
    };
};