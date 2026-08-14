import express from "express";
import cors from "cors";
import mediaRouter from "./routes/media.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "gOGig Media Processing API is running"
    });
});
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "GoGig API is running 🚀"
    });
});
app.use("/api/media", mediaRouter);

export default app;