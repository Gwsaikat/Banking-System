const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountNumber: {
      type: String,
      unique: true,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["savings", "checking"],
      default: "savings",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a unique 10-digit account number before validation
accountSchema.pre("validate", async function () {
  if (!this.accountNumber) {
    let accountNumber;
    let exists = true;
    while (exists) {
      accountNumber =
        "AC" +
        Math.floor(1000000000 + Math.random() * 9000000000).toString();
      exists = await mongoose.models.Account.findOne({ accountNumber });
    }
    this.accountNumber = accountNumber;
  }
});

module.exports = mongoose.model("Account", accountSchema);
