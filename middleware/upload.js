const multer = require("multer");
const path = require("path");

// ======================
// MEMORY STORAGE (FOR CLOUD STORAGE LIKE SUPABASE / S3)
// ======================
const storage = multer.memoryStorage();

// ======================
// FILE FILTER
// ======================
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedExt = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".pdf",
    ".doc",
    ".docx",
  ];

  const allowedMime = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedExt.includes(ext) && allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and documents (PDF, DOC, DOCX) are allowed"));
  }
};

// ======================
// MULTER CONFIG
// ======================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;