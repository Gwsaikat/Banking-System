const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadDocument, queryDocuments } = require("../controllers/documentController");
const { protect } = require("../middlewares/authMiddleware");

// Configure multer for memory storage (process PDF immediately without saving to disk)
const upload = multer({ storage: multer.memoryStorage() });

// Protect all document routes
router.use(protect);

router.post("/upload", upload.single("document"), uploadDocument);
router.post("/query", queryDocuments);

module.exports = router;
