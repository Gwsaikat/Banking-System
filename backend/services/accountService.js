const Account = require("../models/account");

/**
 * Create a new bank account for a user
 */
const createAccount = async (userId, accountType = "savings") => {
  const account = await Account.create({
    user: userId,
    accountType,
  });
  return account;
};

/**
 * Get all accounts for a user
 */
const getAccountsByUser = async (userId) => {
  return await Account.find({ user: userId, isActive: true }).sort({
    createdAt: -1,
  });
};

/**
 * Get a single account by ID and verify ownership
 */
const getAccountById = async (accountId, userId) => {
  const account = await Account.findOne({
    _id: accountId,
    user: userId,
    isActive: true,
  });
  return account;
};

module.exports = { createAccount, getAccountsByUser, getAccountById };
