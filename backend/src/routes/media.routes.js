import express from "express";

import upload from "../middleware/upload.middleware.js";

import {
    uploadMedia,
    getMediaStatus
} from "../controllers/media.controller.js";


const router = express.Router();


/*
 * Upload image
 *
 * POST /api/media
 */
router.post(
    "/",
    upload.single("image"),
    uploadMedia
);


/*
 * Get processing status and results
 *
 * GET /api/media/:processingId
 */
router.get(
    "/:processingId",
    getMediaStatus
);


export default router;