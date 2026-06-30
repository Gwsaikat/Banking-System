const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllTransactions,
  getDashboardStats,
  toggleUserStatus,
  deleteUser,
  resetDatabase,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { checkAnomaly, resolveAnomaly } = require("../services/guardianAgent");

router.use(protect, adminOnly);

router.get("/users", getAllUsers);
router.get("/transactions", getAllTransactions);
router.get("/stats", getDashboardStats);
router.put("/users/:id/toggle", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.post("/reset", resetDatabase);

// --- Guardian Agent Routes ---
router.post("/guardian/analyze", async (req, res) => {
  try {
    const { transaction } = req.body;
    const result = await checkAnomaly(transaction);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/guardian/resolve", async (req, res) => {
  try {
    const { transaction, decision } = req.body; // decision: "approved" or "rejected"
    const result = await resolveAnomaly(transaction, decision);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
