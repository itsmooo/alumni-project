const multer = require("multer")
const path = require("path")

// Configure multer for file uploads
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  // Allow images, documents, and videos
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mov|avi/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error("Invalid file type"))
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
})

module.exports = upload
