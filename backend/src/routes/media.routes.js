import express from "express";
import upload from "../middleware/upload.middleware.js";
import { uploadMedia } from "../controllers/media.controller.js";

const router = express.Router();

router.post("/", upload.single("image"), uploadMedia);

export default router;