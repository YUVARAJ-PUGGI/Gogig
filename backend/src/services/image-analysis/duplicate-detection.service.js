import Media from "../../models/Media.js";

import {
    calculateHammingDistance,
    isPossibleNearDuplicate
} from "./duplicate.service.js";


export const detectDuplicate = async ({
    processingId,
    sha256Hash,
    perceptualHash
}) => {

    // 1. Check for exact duplicate using SHA-256

    const exactDuplicate = await Media.findOne({
        sha256Hash,
        processingId: {
            $ne: processingId
        }
    });

    if (exactDuplicate) {

        return {
            isDuplicate: true,
            type: "exact",
            matchedMediaId: exactDuplicate._id.toString(),
            matchedProcessingId: exactDuplicate.processingId,
            distance: 0
        };

    }


    // 2. Get existing completed images
    //    that have a perceptual hash

    const existingMedia = await Media.find({
        processingId: {
            $ne: processingId
        },

        status: "completed",

        perceptualHash: {
            $exists: true,
            $ne: ""
        }

    }).select(
        "_id processingId perceptualHash"
    );


    // 3. Find the closest pHash match

    let closestMatch = null;
    let smallestDistance = Infinity;


    for (const media of existingMedia) {

        const distance = calculateHammingDistance(
            perceptualHash,
            media.perceptualHash
        );


        if (distance < smallestDistance) {

            smallestDistance = distance;
            closestMatch = media;

        }

    }


    // 4. Check near-duplicate threshold

    if (
        closestMatch &&
        isPossibleNearDuplicate(smallestDistance)
    ) {

        return {
            isDuplicate: true,
            type: "near",
            matchedMediaId: closestMatch._id.toString(),
            matchedProcessingId: closestMatch.processingId,
            distance: smallestDistance
        };

    }


    // 5. Different image

    return {
        isDuplicate: false,
        type: "different",

        matchedMediaId: closestMatch
            ? closestMatch._id.toString()
            : null,

        matchedProcessingId: closestMatch
            ? closestMatch.processingId
            : null,

        distance: closestMatch
            ? smallestDistance
            : null
    };

};