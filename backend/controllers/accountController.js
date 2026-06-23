const Account = require("../models/account");
const Transaction = require("../models/transaction");
const { createAccount, getAccountsByUser, getAccountById } = require("../services/accountService");

/**
 * @desc    Create a new bank account
 * @route   POST /api/accounts
 * @access  Private
 */
const createNewAccount = async (req, res) => {
  try {
    const { accountType } = req.body;

    // Limit to max 5 accounts per user
    const existingAccounts = await Account.countDocuments({
      user: req.user._id,
      isActive: true,
    });
    if (existingAccounts >= 5) {
      return res.status(400).json({ message: "Maximum of 5 accounts allowed per user" });
    }

    const account = await createAccount(req.user._id, accountType);
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Get all accounts for logged-in user
 * @route   GET /api/accounts
 * @access  Private
 */
const getAccounts = async (req, res) => {
  try {
    const accounts = await getAccountsByUser(req.user._id);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single account with recent transactions
 * @route   GET /api/accounts/:id
 * @access  Private
 */
const getAccountDetails = async (req, res) => {
  try {
    const account = await getAccountById(req.params.id, req.user._id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Get last 10 transactions for this account
    const transactions = await Transaction.find({ account: account._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ account, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNewAccount, getAccounts, getAccountDetails };
