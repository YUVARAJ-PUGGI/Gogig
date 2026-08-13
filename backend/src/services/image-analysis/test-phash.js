import {
    generatePerceptualHash,
    calculateHammingDistance
} from "./duplicate.service.js";

const images = [
    {
        name: "Assignment Image 1",
        path: "uploads/assignment-image-1.jpg"
    },
    {
        name: "Assignment Image 2",
        path: "uploads/assignment-image-2.jpg"
    },
    {
        name: "Assignment Image 3",
        path: "uploads/assignment-image-3.jpg"
    },
    {
        name: "Car Normal",
        path: "uploads/car1.jpeg"
    },
    {
        name: "Car Blurred",
        path: "uploads/car-blur.jpeg"
    },
    {
        name: "Car Strongly Blurred",
        path: "uploads/car1-strong-blured.jpeg"
    },
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
        name: "Artificially Blurred",
        path: "uploads/test-blurred.png"
    }
];

const hashes = [];

console.log("\nGenerating pHashes...\n");

for (const image of images) {
    try {
        const hash = await generatePerceptualHash(image.path);

        hashes.push({
            ...image,
            hash
        });

        console.log(`${image.name}: ${hash}`);
    } catch (error) {
        console.error(
            `Failed to process ${image.name}:`,
            error.message
        );
    }
}

console.log("\n========================================");
console.log("PAIRWISE HAMMING DISTANCES");
console.log("========================================\n");

for (let i = 0; i < hashes.length; i++) {

    for (let j = i + 1; j < hashes.length; j++) {

        const image1 = hashes[i];
        const image2 = hashes[j];

        const distance = calculateHammingDistance(
            image1.hash,
            image2.hash
        );

        console.log(
            `${image1.name}  <->  ${image2.name}  =  ${distance}`
        );
    }
}