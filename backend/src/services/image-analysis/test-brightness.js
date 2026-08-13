import { detectBrightness } from "./brightness.service.js";

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
        name: "Artificially Blurred",
        path: "uploads/test-blurred.png"
    },
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
}
];

for (const image of images) {
    const result = await detectBrightness(image.path);

    console.log("\n================================");
    console.log(image.name);
    console.log("File:", image.path);
    console.log(result);
}