const { generateWallet } = require("../utils/walletUtils");
const User = require("../models/User");
const { encrypt } = require("../utils/cryptoUtils");

// Controller to create a virtual wallet
exports.createWallet = async (req, res) => {
    try {
        const userId = req.user.id; // Retrieved from authMiddleware
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.virtualWalletPublicKey) {
            return res.status(400).json({ error: "Virtual wallet already exists" });
        }

        // Generate a new wallet
        const virtualWallet = generateWallet();

        // Update the user's record with the virtual wallet details
        user.virtualWalletPublicKey = virtualWallet.publicKey;
        user.virtualWalletPrivateKey = encrypt(virtualWallet.privateKey);
        await user.save();

        res.status(201).json({
            message: "Virtual wallet created successfully",
            publicKey: user.virtualWalletPublicKey,
        });
    } catch (error) {
        console.error("Error creating wallet:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Controller to get the virtual wallet details
exports.getWallet = async (req, res) => {
    try {
        const userId = req.user.id; // Retrieved from authMiddleware
        const user = await User.findById(userId);

        if (!user || !user.virtualWalletPublicKey) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        res.status(200).json({
            publicKey: user.virtualWalletPublicKey,
        });
    } catch (error) {
        console.error("Error fetching wallet details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
