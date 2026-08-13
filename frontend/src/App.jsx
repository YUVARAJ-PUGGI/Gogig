import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [processingId, setProcessingId] = useState("");
    const [status, setStatus] = useState("idle");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("gogig-theme") === "dark";
    });

    const fileInputRef = useRef(null);

    // Theme handling
    useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            darkMode ? "dark" : "light"
        );

        localStorage.setItem(
            "gogig-theme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

    // Handle selected image
    const handleFile = (file) => {
        if (!file) return;

        setError("");
        setResult(null);
        setProcessingId("");
        setStatus("idle");

        if (!file.type.startsWith("image/")) {
            setSelectedFile(null);
            setPreviewUrl("");
            setError("Please select a valid image file.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setSelectedFile(null);
            setPreviewUrl("");
            setError("Image size must be less than 10 MB.");
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // File input
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (file) {
            handleFile(file);
        }
    };

    // Drag and drop
    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];

        if (file) {
            handleFile(file);
        }
    };

    // Upload image
    const uploadImage = async () => {
        if (!selectedFile) {
            setError("Please select an image first.");
            return;
        }

        try {
            setError("");
            setResult(null);
            setStatus("uploading");

            const formData = new FormData();

            formData.append("image", selectedFile);

            const response = await axios.post(
                `${API_BASE_URL}/api/media`,
                formData
            );

            const id = response.data?.data?.processingId;

            if (!id) {
                throw new Error(
                    "Processing ID was not returned by the server."
                );
            }

            setProcessingId(id);
            setStatus("processing");
        } catch (err) {
            console.error("Upload error:", err);

            setStatus("error");

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to upload image. Make sure the backend is running."
            );
        }
    };

    // Poll processing status
    useEffect(() => {
        if (!processingId) return;

        let intervalId;

        const checkStatus = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/media/${processingId}`
                );

                const data = response.data?.data;

                if (!data) return;

                if (data.status === "completed") {
                    setResult(data);
                    setStatus("completed");

                    if (intervalId) {
                        clearInterval(intervalId);
                    }
                }

                if (data.status === "failed") {
                    setResult(data);
                    setStatus("failed");

                    setError(
                        data.error ||
                            data.analysisResults?.error ||
                            "Image processing failed."
                    );

                    if (intervalId) {
                        clearInterval(intervalId);
                    }
                }
            } catch (err) {
                console.error("Status check failed:", err);
            }
        };

        checkStatus();

        intervalId = setInterval(checkStatus, 2000);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [processingId]);

    // Reset analysis
    const reset = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(null);
        setPreviewUrl("");
        setProcessingId("");
        setStatus("idle");
        setResult(null);
        setError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Analysis result shortcuts
    const duplicate = result?.analysisResults?.duplicate;
    const blur = result?.analysisResults?.blur;
    const brightness = result?.analysisResults?.brightness;
    const dimensions = result?.analysisResults?.dimensions;

    return (
        <div className="app">

            {/* NAVBAR */}
            <header className="navbar">

                <div className="brand">

                    <div className="brand-icon">
                        G
                    </div>

                    <div>
                        <h1>GoGig</h1>
                        <span>Media Intelligence</span>
                    </div>

                </div>

                <div className="nav-actions">

                    <div className="api-status">
                        <span className="status-dot"></span>
                        API Ready
                    </div>

                    <button
                        className="theme-toggle"
                        onClick={() => setDarkMode(!darkMode)}
                        aria-label="Toggle theme"
                    >
                        {darkMode ? "☀️" : "🌙"}
                    </button>

                </div>

            </header>

            {/* MAIN */}
            <main className="container">

                {/* HERO */}
                <section className="hero">

                    <div className="hero-badge">
                        <span></span>
                        AI-POWERED MEDIA ANALYSIS
                    </div>

                    <h2>
                        Analyze your images
                        <span> intelligently.</span>
                    </h2>

                    <p>
                        GoGig automatically detects duplicates, blur,
                        brightness and image quality using an
                        asynchronous media processing pipeline.
                    </p>

                </section>

                {/* WORKSPACE */}
                <section className="workspace">

                    {/* UPLOAD CARD */}
                    <div className="upload-card">

                        <div className="card-heading">

                            <div>
                                <span className="section-label">
                                    STEP 01
                                </span>

                                <h3>
                                    Upload Image
                                </h3>
                            </div>

                            <div className="card-number">
                                01
                            </div>

                        </div>

                        <div
                            className={`drop-zone ${
                                isDragging ? "dragging" : ""
                            }`}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => {
                                setIsDragging(false);
                            }}
                            onDrop={handleDrop}
                            onClick={() => {
                                fileInputRef.current?.click();
                            }}
                        >

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                hidden
                            />

                            {previewUrl ? (

                                <div className="preview-wrapper">

                                    <img
                                        src={previewUrl}
                                        alt="Selected image"
                                        className="preview-image"
                                    />

                                    <div className="preview-overlay">
                                        Click to change image
                                    </div>

                                </div>

                            ) : (

                                <>

                                    <div className="upload-icon">
                                        ↑
                                    </div>

                                    <h3>
                                        Drop your image here
                                    </h3>

                                    <p>
                                        or click to browse from your computer
                                    </p>

                                    <div className="file-types">
                                        JPEG · PNG · WebP · Max 10 MB
                                    </div>

                                </>

                            )}

                        </div>

                        {/* SELECTED FILE */}
                        {selectedFile && (

                            <div className="selected-file">

                                <div>

                                    <strong>
                                        {selectedFile.name}
                                    </strong>

                                    <span>
                                        {(selectedFile.size / 1024).toFixed(1)}
                                        {" "}KB
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    className="remove-button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        reset();
                                    }}
                                >
                                    ×
                                </button>

                            </div>

                        )}

                        {/* ERROR */}
                        {error && (

                            <div className="error-message">

                                <span>!</span>

                                <span>
                                    {error}
                                </span>

                            </div>

                        )}

                        {/* ANALYZE BUTTON */}
                        <button
                            type="button"
                            className="analyze-button"
                            disabled={
                                !selectedFile ||
                                status === "uploading" ||
                                status === "processing"
                            }
                            onClick={uploadImage}
                        >

                            {status === "uploading"
                                ? "Uploading..."
                                : status === "processing"
                                ? "Analyzing..."
                                : "Analyze Image →"}

                        </button>

                    </div>

                    {/* RESULTS CARD */}
                    <div className="results-card">

                        <div className="card-heading">

                            <div>

                                <span className="section-label">
                                    STEP 02
                                </span>

                                <h3>
                                    Analysis Results
                                </h3>

                            </div>

                            {status === "completed" && (

                                <span className="completed-badge">
                                    ✓ Completed
                                </span>

                            )}

                        </div>

                        {/* EMPTY STATE */}
                        {status === "idle" && (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    ✦
                                </div>

                                <h4>
                                    Waiting for an image
                                </h4>

                                <p>
                                    Upload an image and our processing
                                    pipeline will analyze it automatically.
                                </p>

                            </div>

                        )}

                        {/* PROCESSING STATE */}
                        {(status === "uploading" ||
                            status === "processing") && (

                            <div className="processing-state">

                                <div className="spinner"></div>

                                <h4>
                                    {status === "uploading"
                                        ? "Uploading image..."
                                        : "Analyzing image..."}
                                </h4>

                                <p>
                                    GoGig is processing your image
                                    in the background.
                                </p>

                                {processingId && (
                                    <small>
                                        Job ID: {processingId}
                                    </small>
                                )}

                            </div>

                        )}

                        {/* RESULTS */}
                        {result && (

                            <div className="results-content">

                                {/* CLOUDINARY IMAGE */}
                                {result.cloudinaryUrl && (

                                    <div className="cloudinary-preview">

                                        <img
                                            src={result.cloudinaryUrl}
                                            alt={result.originalName}
                                        />

                                        <a
                                            href={result.cloudinaryUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Open image ↗
                                        </a>

                                    </div>

                                )}

                                {/* ANALYSIS CARDS */}
                                <div className="result-grid">

                                    <ResultItem
                                        title="Duplicate"
                                        value={
                                            duplicate?.isDuplicate
                                                ? "Duplicate"
                                                : "Unique"
                                        }
                                        detail={
                                            duplicate?.isDuplicate
                                                ? duplicate.type
                                                : "No duplicate detected"
                                        }
                                        positive={
                                            !duplicate?.isDuplicate
                                        }
                                    />

                                    <ResultItem
                                        title="Blur Detection"
                                        value={
                                            blur?.isBlurry
                                                ? "Blurry"
                                                : "Sharp"
                                        }
                                        detail={
                                            blur
                                                ? `Score: ${blur.score}`
                                                : "No blur detected"
                                        }
                                        positive={!blur?.isBlurry}
                                    />

                                    <ResultItem
                                        title="Brightness"
                                        value={
                                            brightness?.level
                                                ? capitalize(
                                                      brightness.level
                                                  )
                                                : "N/A"
                                        }
                                        detail={
                                            brightness
                                                ? `Mean: ${brightness.meanBrightness}`
                                                : "No brightness data"
                                        }
                                        positive={
                                            brightness?.level === "normal"
                                        }
                                    />

                                    <ResultItem
                                        title="Dimensions"
                                        value={
                                            dimensions?.isValid
                                                ? "Valid"
                                                : "Invalid"
                                        }
                                        detail={
                                            dimensions
                                                ? `${dimensions.width} × ${dimensions.height}`
                                                : "No dimension data"
                                        }
                                        positive={
                                            dimensions?.isValid
                                        }
                                    />

                                </div>

                                {/* TECHNICAL DETAILS */}
                                <div className="technical-details">

                                    <div>
                                        <span>
                                            Processing ID
                                        </span>

                                        <code>
                                            {result.processingId}
                                        </code>
                                    </div>

                                    <div>
                                        <span>
                                            File type
                                        </span>

                                        <strong>
                                            {result.mimeType}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            File size
                                        </span>

                                        <strong>
                                            {(result.fileSize / 1024).toFixed(1)}
                                            {" "}KB
                                        </strong>
                                    </div>

                                    {/* Only show matched ID for duplicates */}
                                    {duplicate?.isDuplicate &&
                                        duplicate?.matchedProcessingId && (

                                            <div>
                                                <span>
                                                    Matched Processing ID
                                                </span>

                                                <code>
                                                    {duplicate.matchedProcessingId}
                                                </code>
                                            </div>

                                        )}

                                </div>

                                {/* NEW ANALYSIS */}
                                <button
                                    type="button"
                                    className="new-analysis"
                                    onClick={reset}
                                >
                                    + Analyze another image
                                </button>

                            </div>

                        )}

                    </div>

                </section>

            </main>

            {/* FOOTER */}
            <footer>

                <span>
                    © 2026 GoGig Media Intelligence
                </span>

                <span>
                    React · Node.js · MongoDB · Cloudinary
                </span>

            </footer>

        </div>
    );
}


/*
 * Result card component
 */
function ResultItem({
    title,
    value,
    detail,
    positive,
}) {
    return (

        <div className="result-item">

            <div className="result-top">

                <span>
                    {title}
                </span>

                <span
                    className={`result-indicator ${
                        positive ? "good" : "warning"
                    }`}
                >
                    {positive ? "✓" : "!"}
                </span>

            </div>

            <strong>
                {value}
            </strong>

            <small>
                {detail}
            </small>

        </div>

    );
}


/*
 * Capitalize helper
 */
function capitalize(value) {
    if (!value) return "";

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}


export default App;