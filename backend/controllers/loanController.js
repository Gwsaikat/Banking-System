const Loan = require("../models/loan");
const Account = require("../models/account");

/**
 * @desc    Apply for a loan
 * @route   POST /api/loans
 * @access  Private
 */
const applyLoan = async (req, res) => {
  try {
    const { accountId, amount, termMonths, purpose, interestRate } = req.body;

    if (!accountId || !amount || !termMonths || !purpose) {
      return res.status(400).json({
        message: "Account ID, amount, term, and purpose are required",
      });
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

    // Check for existing pending loans
    const pendingLoan = await Loan.findOne({
      user: req.user._id,
      status: "pending",
    });
    if (pendingLoan) {
      return res.status(400).json({
        message: "You already have a pending loan application",
      });
    }

    const loan = await Loan.create({
      user: req.user._id,
      account: accountId,
      amount,
      termMonths,
      purpose,
      interestRate: interestRate || 5.5,
    });

    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Get user's loans
 * @route   GET /api/loans
 * @access  Private
 */
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user._id })
      .populate("account", "accountNumber accountType")
      .sort({ createdAt: -1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single loan details
 * @route   GET /api/loans/:id
 * @access  Private
 */
const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("account", "accountNumber accountType")
      .populate("approvedBy", "firstName lastName");

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all loans (admin)
 * @route   GET /api/loans/admin/all
 * @access  Admin
 */
const getAllLoans = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const loans = await Loan.find(filter)
      .populate("user", "firstName lastName email")
      .populate("account", "accountNumber accountType")
      .sort({ createdAt: -1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve a loan (admin)
 * @route   PUT /api/loans/:id/approve
 * @access  Admin
 */
const approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status !== "pending") {
      return res.status(400).json({ message: "Loan is not in pending status" });
    }

    loan.status = "approved";
    loan.approvedBy = req.user._id;
    await loan.save();

    // Deposit loan amount into the linked account
    const account = await Account.findById(loan.account);
    if (account) {
      account.balance += loan.amount;
      await account.save();
    }

    res.json({ message: "Loan approved successfully", loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reject a loan (admin)
 * @route   PUT /api/loans/:id/reject
 * @access  Admin
 */
const rejectLoan = async (req, res) => {
  try {
    const { reason } = req.body;

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status !== "pending") {
      return res.status(400).json({ message: "Loan is not in pending status" });
    }

    loan.status = "rejected";
    loan.rejectionReason = reason || "Application rejected by admin";
    loan.approvedBy = req.user._id;
    await loan.save();

    res.json({ message: "Loan rejected", loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyLoan,
  getLoans,
  getLoanById,
  getAllLoans,
  approveLoan,
  rejectLoan,
};
