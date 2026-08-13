import {
    generateImageHash,
    generatePerceptualHash,
    calculateHammingDistance,
    PHASH_THRESHOLD,
    isPossibleNearDuplicate
} from "./duplicate.service.js";

const images = [
    {
        name: "Original",
        path: "uploads/1786544486932-940233332.png"
    },
    {
        name: "Different Image",
        path: "uploads/1786594019636-568152361.png"
    },
    {
        name: "Resized",
        path: "uploads/test-resized.png"
    },
    {
        name: "Compressed",
        path: "uploads/test-compressed.jpg"
    },
    {
        name: "Bright",
        path: "uploads/test-bright.png"
    },
    {
        name: "Dark",
        path: "uploads/test-dark.png"
    },
    {
        name: "Blurred",
        path: "uploads/test-blurred.png"
    },
    {
        name: "Assignment 1",
        path: "uploads/assignment-image-1.jpg"
    },
    {
        name: "Assignment 2",
        path: "uploads/assignment-image-2.jpg"
    },
    {
        name: "Assignment 3",
        path: "uploads/assignment-image-3.jpg"
    },
    {
        name: "Screenshot 1",
        path: "uploads/screenshot1.jpeg"
    },
    {
        name: "Screenshot 2",
        path: "uploads/screenshot2.jpeg"
    },
    {
        name: "Screenshot 3",
        path: "uploads/screenshot3.jpeg"
    }
];

const hashes = [];

for (const image of images) {
    const sha256 = generateImageHash(image.path);
    const pHash = await generatePerceptualHash(image.path);

    hashes.push({
        ...image,
        sha256,
        pHash
    });
}

console.log("\n========== HASH INFORMATION ==========\n");

for (const image of hashes) {
    console.log(`${image.name}`);
    console.log(`SHA-256: ${image.sha256}`);
    console.log(`pHash length: ${image.pHash.length} bits`);
    console.log();
}

console.log("========================================");
console.log(`pHash threshold: ${PHASH_THRESHOLD}`);
console.log("========================================\n");

console.log("========== SIMILARITY ANALYSIS ==========\n");

for (let i = 0; i < hashes.length; i++) {
    for (let j = i + 1; j < hashes.length; j++) {

        const distance = calculateHammingDistance(
            hashes[i].pHash,
            hashes[j].pHash
        );

        let result;

        if (distance <= 18) {
            result = "HIGH CONFIDENCE NEAR-DUPLICATE";
        } else if (isPossibleNearDuplicate(distance)) {
            result = "POSSIBLE NEAR-DUPLICATE";
        } else {
            result = "DIFFERENT";
        }

        console.log(`${hashes[i].name} ↔ ${hashes[j].name}`);
        console.log(`Distance: ${distance}`);
        console.log(`Result: ${result}`);
        console.log("----------------------------------------");
    }
}