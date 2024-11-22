
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, unique: true, required: true },
  virtualWalletPrivateKey: { type: String, required: true },
  virtualWalletPublicKey: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);