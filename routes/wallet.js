const express = require("express");
const { createWallet, getWallet, getBalance, fetchWalletDetails } = require("../controllers/walletController");
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

module.exports = router;
