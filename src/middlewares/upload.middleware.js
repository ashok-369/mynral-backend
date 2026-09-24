import multer from "multer";

// ============================================================
// MULTER MEMORY STORAGE
// ============================================================
// Files are kept in memory temporarily.
// They will be uploaded to Cloudinary in the next step.
// ============================================================

const storage = multer.memoryStorage();

// ============================================================
// ALLOWED IMAGE TYPES
// ============================================================

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "Only JPG, JPEG, PNG, and WEBP image files are allowed."
      ),
      false
    );
  }

  cb(null, true);
};

// ============================================================
// MULTER INSTANCE
// ============================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    // Maximum 10 files
    files: 10,

    // Maximum 5 MB for each image
    fileSize: 5 * 1024 * 1024,
  },
});

// ============================================================
// PRODUCT IMAGES
// ============================================================
// Frontend/Postman field name:
// images
//
// Maximum:
// 10 images
// ============================================================

export const uploadProductImages = upload.array("images", 10);

// ============================================================
// SINGLE IMAGE
// ============================================================
// Can be reused later for:
// - Category image
// - Banner image
// - Profile image
// etc.
// ============================================================

export const uploadSingleImage = upload.single("image");

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default upload;