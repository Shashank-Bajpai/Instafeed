const multer = require("multer");

// Unlike our Cloudinary upload config, this keeps the file in memory (RAM)
// temporarily — we just need the raw bytes to send to the AI, not to store it.
const memoryUpload = multer({ storage: multer.memoryStorage() });

module.exports = memoryUpload;