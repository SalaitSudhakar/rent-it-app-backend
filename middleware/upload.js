import multer from "multer";

const allowedMimeType = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb ) => { // req, file(object), cb(callback function)
    if (allowedMimeType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only upload jpeg, jpg, png image files."), false);
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  }
});

// Export middleware
export default upload.array("photos", 10)