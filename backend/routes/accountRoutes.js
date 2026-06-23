const express = require("express");
const router = express.Router();
const {
  createNewAccount,
  getAccounts,
  getAccountDetails,
} = require("../controllers/accountController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.post("/", createNewAccount);
router.get("/", getAccounts);
router.get("/:id", getAccountDetails);

module.exports = router;
