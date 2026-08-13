import multer from "multer";


// Store uploaded files in memory temporarily.
// The file will be uploaded directly to Cloudinary.
const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only JPEG, PNG and WebP images are allowed"
            ),
            false
        );

    }
};


const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024
    }

});


export default upload;