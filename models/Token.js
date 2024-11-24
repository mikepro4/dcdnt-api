const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  url: String,
  chainId: String,
  tokenAddress: String,
  icon: String,
  header: String,
  openGraph: String,
  description: String,
  links: [
    {
      type: { type: String },
      url: String,
    },
  ],
  isCronActive: { type: Boolean, default: false }, // Track active cron job state
  cronJobId: String, // Optional, store cron job ID for debugging
});

module.exports = mongoose.model('Token', TokenSchema);