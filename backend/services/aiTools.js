const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const Account = require("../models/account");
const Transaction = require("../models/transaction");
const { searchSemanticTransactions } = require("./ragService");

// Factory function to create tools bound to a specific userId
const createAiTools = (userId) => {
  const getAccountsTool = new DynamicStructuredTool({
    name: "get_user_accounts",
    description: "Get the balances and details of the user's bank accounts. Call this to find out what accounts the user has and their account IDs.",
    schema: z.object({}), // No arguments needed, we use the injected userId
    func: async () => {
      try {
        const accounts = await Account.find({ user: userId, isActive: true }).select("accountType balance accountNumber _id");
        if (accounts.length === 0) return "No active accounts found for this user.";
        return JSON.stringify(accounts);
      } catch (error) {
        return `Error fetching accounts: ${error.message}`;
      }
    },
  });

  const getTransactionsTool = new DynamicStructuredTool({
    name: "get_recent_transactions",
    description: "Get recent transactions for a specific account. Always use this to answer questions about recent spending, deposits, or transfers.",
    schema: z.object({
      accountId: z.string().describe("The _id of the account to fetch transactions for"),
      limit: z.number().optional().describe("Number of transactions to fetch (default: 10, max: 20)"),
    }),
    func: async ({ accountId, limit = 10 }) => {
      try {
        // First verify the account belongs to the user for security
        const account = await Account.findOne({ _id: accountId, user: userId });
        if (!account) {
          return "Error: Account not found or does not belong to the user.";
        }

        const safeLimit = Math.min(limit, 20); // Prevent context overflow
        const transactions = await Transaction.find({ account: accountId })
          .sort({ createdAt: -1 })
          .limit(safeLimit)
          .select("amount type description status createdAt balanceAfter");
          
        if (transactions.length === 0) return "No recent transactions found for this account.";
        return JSON.stringify(transactions);
      } catch (error) {
        return `Error fetching transactions: ${error.message}`;
      }
    },
  });

  const semanticTransactionSearchTool = new DynamicStructuredTool({
    name: "semantic_transaction_search",
    description: "Search the user's transactions by meaning/semantics. Useful for fuzzy queries like 'when did I buy coffee' or 'groceries'.",
    schema: z.object({
      query: z.string().describe("The semantic query to search for"),
    }),
    func: async ({ query }) => {
      try {
        const results = await searchSemanticTransactions(query, userId);
        if (results.length === 0) return "No matching transactions found.";
        return JSON.stringify(results);
      } catch (error) {
        return `Error in semantic search: ${error.message}`;
      }
    },
  });

  return [getAccountsTool, getTransactionsTool, semanticTransactionSearchTool];
};

module.exports = { createAiTools };
