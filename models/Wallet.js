const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  walletAddress: String,
  balance: Number,
  transactions: [
    {
      type: { type: String }, // "deposit" or "withdraw"
      amount: Number,
      date: { type: Date, default: Date.now },
    },
  ],
});

WalletSchema.index({ walletAddress: 1 });

module.exports = mongoose.model("Wallet", WalletSchema);