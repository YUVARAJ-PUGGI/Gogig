import sharp from "sharp";

const original = "uploads/1786544486932-940233332.png";

await sharp(original)
    .resize(400)
    .png()
    .toFile("uploads/test-resized.png");

await sharp(original)
    .jpeg({ quality: 40 })
    .toFile("uploads/test-compressed.jpg");

await sharp(original)
    .modulate({ brightness: 1.8 })
    .png()
    .toFile("uploads/test-bright.png");

await sharp(original)
    .modulate({ brightness: 0.3 })
    .png()
    .toFile("uploads/test-dark.png");

await sharp(original)
    .blur(8)
    .png()
    .toFile("uploads/test-blurred.png");

console.log("All test images created successfully.");