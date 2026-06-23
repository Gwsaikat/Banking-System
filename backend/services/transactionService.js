const mongoose = require("mongoose");
const Account = require("../models/account");
const Transaction = require("../models/transaction");

/**
 * Process a deposit
 */
const deposit = async (accountId, amount, description = "Deposit") => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await Account.findById(accountId).session(session);
    if (!account) throw new Error("Account not found");
    if (!account.isActive) throw new Error("Account is not active");

    account.balance += amount;
    await account.save({ session });

    const transaction = await Transaction.create(
      [
        {
          account: accountId,
          type: "deposit",
          amount,
          balanceAfter: account.balance,
          description,
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { transaction: transaction[0], newBalance: account.balance };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Process a withdrawal
 */
const withdraw = async (accountId, amount, description = "Withdrawal") => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await Account.findById(accountId).session(session);
    if (!account) throw new Error("Account not found");
    if (!account.isActive) throw new Error("Account is not active");
    if (account.balance < amount) throw new Error("Insufficient funds");

    account.balance -= amount;
    await account.save({ session });

    const transaction = await Transaction.create(
      [
        {
          account: accountId,
          type: "withdrawal",
          amount,
          balanceAfter: account.balance,
          description,
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { transaction: transaction[0], newBalance: account.balance };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Process a transfer between accounts
 */
const transfer = async (fromAccountId, toAccountNumber, amount, description = "Transfer") => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fromAccount = await Account.findById(fromAccountId).session(session);
    if (!fromAccount) throw new Error("Source account not found");
    if (!fromAccount.isActive) throw new Error("Source account is not active");
    if (fromAccount.balance < amount) throw new Error("Insufficient funds");

    const toAccount = await Account.findOne({ accountNumber: toAccountNumber, isActive: true }).session(session);
    if (!toAccount) throw new Error("Destination account not found");
    if (fromAccount._id.equals(toAccount._id)) throw new Error("Cannot transfer to the same account");

    // Debit source
    fromAccount.balance -= amount;
    await fromAccount.save({ session });

    // Credit destination
    toAccount.balance += amount;
    await toAccount.save({ session });

    // Create debit transaction
    const debitTxn = await Transaction.create(
      [
        {
          account: fromAccount._id,
          toAccount: toAccount._id,
          type: "transfer",
          amount,
          balanceAfter: fromAccount.balance,
          description: `Transfer to ${toAccount.accountNumber} - ${description}`,
          status: "completed",
        },
      ],
      { session }
    );

    // Create credit transaction
    await Transaction.create(
      [
        {
          account: toAccount._id,
          toAccount: fromAccount._id,
          type: "deposit",
          amount,
          balanceAfter: toAccount.balance,
          description: `Transfer from ${fromAccount.accountNumber} - ${description}`,
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { transaction: debitTxn[0], newBalance: fromAccount.balance };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = { deposit, withdraw, transfer };
