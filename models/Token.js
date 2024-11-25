const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    created: { type: Date, default: Date.now },
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
    oneMinutePriceChange: { type: String, default: null }, // 1-min price change
    twoMinutePriceChange: { type: String, default: null }, // 2-min price change
    fiveMinutePriceChange: { type: String, default: null }, // 5-min price change
    tenMinutePriceChange: { type: String, default: null }, // 10-min price change

});

module.exports = mongoose.model('Token', TokenSchema);