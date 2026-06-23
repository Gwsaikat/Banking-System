const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Loan amount is required"],
      min: [100, "Minimum loan amount is $100"],
    },
    interestRate: {
      type: Number,
      required: true,
      default: 5.5,
      min: 0,
      max: 30,
    },
    termMonths: {
      type: Number,
      required: [true, "Loan term is required"],
      min: [1, "Minimum term is 1 month"],
      max: [360, "Maximum term is 360 months"],
    },
    monthlyPayment: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "paid"],
      default: "pending",
    },
    purpose: {
      type: String,
      required: [true, "Loan purpose is required"],
      trim: true,
      maxlength: 300,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate monthly payment before saving
loanSchema.pre("save", function () {
  if (this.isModified("amount") || this.isModified("interestRate") || this.isModified("termMonths")) {
    const monthlyRate = this.interestRate / 100 / 12;
    if (monthlyRate === 0) {
      this.monthlyPayment = this.amount / this.termMonths;
    } else {
      this.monthlyPayment =
        (this.amount * monthlyRate * Math.pow(1 + monthlyRate, this.termMonths)) /
        (Math.pow(1 + monthlyRate, this.termMonths) - 1);
    }
    this.monthlyPayment = Math.round(this.monthlyPayment * 100) / 100;
  }
});

module.exports = mongoose.model("Loan", loanSchema);
