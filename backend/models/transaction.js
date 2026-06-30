const mongoose = require("mongoose");
const crypto = require("crypto");

const transactionSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "transfer"],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    referenceId: {
      type: String,
      unique: true,
    },
    embedding: {
      type: [Number],
      default: undefined,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a unique reference ID before validation
transactionSchema.pre("validate", function () {
  if (!this.referenceId) {
    this.referenceId = "TXN" + crypto.randomBytes(8).toString("hex").toUpperCase();
  }
});

// Index for faster queries
transactionSchema.index({ account: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
