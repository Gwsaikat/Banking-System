const User = require("../models/user");
const Account = require("../models/account");
const Transaction = require("../models/transaction");
const Loan = require("../models/loan");

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-__v").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all transactions (admin)
 * @route   GET /api/admin/transactions
 * @access  Admin
 */
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find({})
      .populate({
        path: "account",
        select: "accountNumber accountType",
        populate: { path: "user", select: "firstName lastName email" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments();

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

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAccounts = await Account.countDocuments({ isActive: true });
    const totalTransactions = await Transaction.countDocuments();
    const pendingLoans = await Loan.countDocuments({ status: "pending" });

    // Total balance across all accounts
    const balanceResult = await Account.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalBalance: { $sum: "$balance" } } },
    ]);
    const totalBalance = balanceResult.length > 0 ? balanceResult[0].totalBalance : 0;

    // Transaction volume (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const volumeResult = await Transaction.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, totalVolume: { $sum: "$amount" } } },
    ]);
    const transactionVolume = volumeResult.length > 0 ? volumeResult[0].totalVolume : 0;

    // Recent transactions (last 7 days, grouped by day)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyTransactions = await Transaction.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          volume: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers,
      totalAccounts,
      totalTransactions,
      pendingLoans,
      totalBalance,
      transactionVolume,
      dailyTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Toggle user active status
 * @route   PUT /api/admin/users/:id/toggle
 * @access  Admin
 */
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: "Cannot deactivate your own account" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete user and all associated accounts/transactions/loans
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    // Find all accounts of the user to clear their transactions
    const userAccounts = await Account.find({ user: user._id });
    const accountIds = userAccounts.map((acc) => acc._id);

    // Delete associated documents
    await Account.deleteMany({ user: user._id });
    await Loan.deleteMany({ user: user._id });
    await Transaction.deleteMany({ account: { $in: accountIds } });
    await User.findByIdAndDelete(user._id);

    res.json({ message: "User and all associated accounts and records deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reset database (delete all transactions, loans, accounts, and non-admin users)
 * @route   POST /api/admin/reset
 * @access  Admin
 */
const resetDatabase = async (req, res) => {
  try {
    // Delete all transactions
    await Transaction.deleteMany({});
    
    // Delete all loans
    await Loan.deleteMany({});
    
    // Delete all accounts
    await Account.deleteMany({});
    
    // Delete all users except the current admin
    await User.deleteMany({ _id: { $ne: req.user._id } });

    res.json({ message: "Database reset completed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, getAllTransactions, getDashboardStats, toggleUserStatus, deleteUser, resetDatabase };
