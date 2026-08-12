import { detectBrightness } from "./brightness.service.js";

const imagePath = "uploads/1786544486932-940233332.png";

const result = await detectBrightness(imagePath);

console.log("Brightness analysis result:");
console.log(result);