const express = require("express");
const router = express.Router();
const {
  applyLoan,
  getLoans,
  getLoanById,
  getAllLoans,
  approveLoan,
  rejectLoan,
} = require("../controllers/loanController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

router.use(protect);

// User routes
router.post("/", applyLoan);
router.get("/", getLoans);

// Admin routes (must come before /:id to avoid conflict)
router.get("/admin/all", adminOnly, getAllLoans);
router.put("/:id/approve", adminOnly, approveLoan);
router.put("/:id/reject", adminOnly, rejectLoan);

// User route (specific loan)
router.get("/:id", getLoanById);

module.exports = router;
