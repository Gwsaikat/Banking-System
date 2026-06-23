const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllTransactions,
  getDashboardStats,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

router.use(protect, adminOnly);

router.get("/users", getAllUsers);
router.get("/transactions", getAllTransactions);
router.get("/stats", getDashboardStats);
router.put("/users/:id/toggle", toggleUserStatus);
router.delete("/users/:id", deleteUser);

module.exports = router;
