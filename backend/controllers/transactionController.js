const Transaction = require("../models/transaction");
const Account = require("../models/account");
const transactionService = require("../services/transactionService");

/**
 * @desc    Deposit funds into an account
 * @route   POST /api/transactions/deposit
 * @access  Private
 */
const depositFunds = async (req, res) => {
  try {
    const { accountId, amount, description } = req.body;

    if (!accountId || !amount) {
      return res.status(400).json({ message: "Account ID and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Verify account belongs to user
    const account = await Account.findOne({
      _id: accountId,
      user: req.user._id,
      isActive: true,
    });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const result = await transactionService.deposit(accountId, amount, description);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Withdraw funds from an account
 * @route   POST /api/transactions/withdraw
 * @access  Private
 */
const withdrawFunds = async (req, res) => {
  try {
    const { accountId, amount, description } = req.body;

    if (!accountId || !amount) {
      return res.status(400).json({ message: "Account ID and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Verify account belongs to user
    const account = await Account.findOne({
      _id: accountId,
      user: req.user._id,
      isActive: true,
    });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const result = await transactionService.withdraw(accountId, amount, description);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Transfer funds between accounts
 * @route   POST /api/transactions/transfer
 * @access  Private
 */
const transferFunds = async (req, res) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description } = req.body;

    if (!fromAccountId || !toAccountNumber || !amount) {
      return res.status(400).json({
        message: "Source account, destination account number, and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Verify source account belongs to user
    const account = await Account.findOne({
      _id: fromAccountId,
      user: req.user._id,
      isActive: true,
    });
    if (!account) {
      return res.status(404).json({ message: "Source account not found" });
    }

    const result = await transactionService.transfer(
      fromAccountId,
      toAccountNumber,
      amount,
      description
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Get transaction history for user's accounts
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res) => {
  try {
    const { accountId, type, page = 1, limit = 20 } = req.query;

    // Get all user account IDs
    const userAccounts = await Account.find({ user: req.user._id }).select("_id");
    const accountIds = userAccounts.map((a) => a._id);

    // Build filter
    const filter = { account: { $in: accountIds } };
    if (accountId) filter.account = accountId;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(filter)
      .populate("account", "accountNumber accountType")
      .populate("toAccount", "accountNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { depositFunds, withdrawFunds, transferFunds, getTransactions };
