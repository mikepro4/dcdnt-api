const { generateWallet } = require("../utils/walletUtils");
const User = require("../models/User");
const { encrypt } = require("../utils/cryptoUtils");
const fetch = require("node-fetch");
const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require("@solana/web3.js");


const alchemyRpcUrl = process.env.ALCHEMY_RPC_URL;

exports.getBalance = async (walletAddress) => {
    console.log("Fetching balance for:", walletAddress); // Debug log
    const response = await fetch(alchemyRpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getBalance",
            params: [walletAddress],
        }),
    });

    const data = await response.json();
    console.log("Balance API response:", data); // Debug log
    if (!data.result) throw new Error("Invalid response from Alchemy");

    return data.result.value / 1e9; // Convert from lamports to SOL
};

const transferFunds = async (fromPrivateKey, toAddress, amount) => {
    try {
        const connection = new Connection(alchemyRpcUrl, "confirmed");

        // Decode the private key and create a Keypair
        const fromKeypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(fromPrivateKey)));

        // Create a transaction
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromKeypair.publicKey,
                toPubkey: new PublicKey(toAddress),
                lamports: amount * 1e9, // Convert SOL to lamports
            })
        );

        // Sign the transaction
        const signature = await connection.sendTransaction(transaction, [fromKeypair]);

        // Confirm the transaction
        await connection.confirmTransaction(signature);

        return { success: true, signature };
    } catch (error) {
        console.error("Error transferring funds:", error);
        throw new Error("Transaction failed");
    }
};



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
