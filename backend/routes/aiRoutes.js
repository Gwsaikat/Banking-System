const express = require("express");
const router = express.Router();
const { askQuestion } = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");

// Secure the entire route so we always have req.user
router.use(protect);

router.post("/ask", askQuestion);

module.exports = router;
