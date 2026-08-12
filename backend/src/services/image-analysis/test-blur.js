import { detectBlur } from "./blur.service.js";

const imagePath = "uploads/1786555849097-730074573.png";

const result = await detectBlur(imagePath);

console.log("Blur analysis result:");
console.log(result);