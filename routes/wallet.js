const express = require("express");
const { createWallet, getWallet, getBalance, transferFunds, fetchWalletDetails } = require("../controllers/walletController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Define your routes here
router.post("/create", createWallet);
router.get("/get", authMiddleware, getWallet);

router.get("/balance/:walletAddress", async (req, res) => {
    try {
        const balance = await getBalance(req.params.walletAddress);
        res.json({ balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/details", authMiddleware, fetchWalletDetails);

router.post("/deposit", async (req, res) => {
    try {
        const { fromPrivateKey, toAddress, amount } = req.body;

        // Process the deposit
        const transaction = await transferFunds(fromPrivateKey, toAddress, amount);

        // Update database
        await Wallet.findOneAndUpdate(
            { walletAddress: toAddress },
            {
                $inc: { balance: amount },
                $push: {
                    transactions: { type: "deposit", amount, date: new Date() },
                },
            },
            { upsert: true }
        );

        res.json({ transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/withdraw", async (req, res) => {
    try {
        const { fromPrivateKey, toAddress, amount } = req.body;

        // Process the withdrawal
        const transaction = await transferFunds(fromPrivateKey, toAddress, amount);

        // Update database
        await Wallet.findOneAndUpdate(
            { walletAddress: fromPrivateKey },
            {
                $inc: { balance: -amount },
                $push: {
                    transactions: { type: "withdraw", amount, date: new Date() },
                },
            }
        );

        res.json({ transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});;

module.exports = router;
