import crypto from "crypto";
import fs from "fs";
import sharp from "sharp";

const HASH_SIZE = 32;
const LOW_FREQUENCY_SIZE = 8;

// Initial threshold calibrated using assignment test images.
export const PHASH_THRESHOLD = 28;

/**
 * Generate SHA-256 hash.
 * Used for exact duplicate detection.
 */
export const generateImageHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);

    return crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");
};

/**
 * Generate a 64-bit DCT-based perceptual hash.
 * Used for detecting visually similar / near-duplicate images.
 */
export const generatePerceptualHash = async (filePath) => {
    const { data } = await sharp(filePath)
        .resize(HASH_SIZE, HASH_SIZE, {
            fit: "fill"
        })
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const pixels = Array.from(data);

    const dct = [];

    for (let u = 0; u < LOW_FREQUENCY_SIZE; u++) {
        dct[u] = [];

        for (let v = 0; v < LOW_FREQUENCY_SIZE; v++) {
            let sum = 0;

            for (let x = 0; x < HASH_SIZE; x++) {
                for (let y = 0; y < HASH_SIZE; y++) {
                    const pixel = pixels[x * HASH_SIZE + y];

                    sum +=
                        pixel *
                        Math.cos(
                            ((2 * x + 1) * u * Math.PI) /
                                (2 * HASH_SIZE)
                        ) *
                        Math.cos(
                            ((2 * y + 1) * v * Math.PI) /
                                (2 * HASH_SIZE)
                        );
                }
            }

            const alphaU =
                u === 0 ? 1 / Math.sqrt(2) : 1;

            const alphaV =
                v === 0 ? 1 / Math.sqrt(2) : 1;

            dct[u][v] =
                0.25 *
                alphaU *
                alphaV *
                sum;
        }
    }

    // Use all 64 low-frequency DCT coefficients.
    const coefficients = [];

    for (let u = 0; u < LOW_FREQUENCY_SIZE; u++) {
        for (let v = 0; v < LOW_FREQUENCY_SIZE; v++) {
            coefficients.push(dct[u][v]);
        }
    }

    const sorted = [...coefficients].sort((a, b) => a - b);

    const median = sorted[Math.floor(sorted.length / 2)];

    let hash = "";

    for (const coefficient of coefficients) {
        hash += coefficient >= median ? "1" : "0";
    }

    return hash;
};

/**
 * Calculate Hamming distance between two perceptual hashes.
 */
export const calculateHammingDistance = (hash1, hash2) => {
    if (hash1.length !== hash2.length) {
        throw new Error("Hashes must have the same length");
    }

    let distance = 0;

    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) {
            distance++;
        }
    }

    return distance;
};

/**
 * Check whether two images are possible near-duplicates.
 */
export const isPossibleNearDuplicate = (hammingDistance) => {
    return hammingDistance <= PHASH_THRESHOLD;
};