const express = require("express");
const router = express.Router();
const {
  depositFunds,
  withdrawFunds,
  transferFunds,
  getTransactions,
} = require("../controllers/transactionController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.post("/deposit", depositFunds);
router.post("/withdraw", withdrawFunds);
router.post("/transfer", transferFunds);
router.get("/", getTransactions);

module.exports = router;
