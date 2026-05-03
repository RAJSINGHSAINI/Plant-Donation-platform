import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); 
    },
    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() +
            "-" +
            Math.floor(100000 + Math.random() * 900000) +
            "-" +
            file.originalname;

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

export const uploadPlantImages = upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 }
]);

export default upload;