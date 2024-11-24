const { generateWallet } = require("../utils/walletUtils");
const User = require("../models/User");
const { encrypt } = require("../utils/cryptoUtils");
const crypto = require("crypto");
const fetch = require("node-fetch");
const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require("@solana/web3.js");


const alchemyRpcUrl = process.env.ALCHEMY_RPC_URL;

exports.fetchWalletDetails = async (req, res) => {
    try {
        const { walletAddress } = req.body;

        const user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Decrypt private key
        const decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            Buffer.from(process.env.ENCRYPTION_SECRET_KEY, "hex"),
            Buffer.from(process.env.ENCRYPTION_IV, "hex")
        );
        let decryptedPrivateKey = decipher.update(user.virtualWalletPrivateKey, "hex", "utf8");
        decryptedPrivateKey += decipher.final("utf8");

        return res.status(200).json({
            publicKey: user.virtualWalletPublicKey,
            privateKey: decryptedPrivateKey, // Decrypted private key
        });
    } catch (error) {
        console.error("Error fetching wallet details:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

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

exports.transferFunds = async (fromPrivateKey, toAddress, amount) => {
    try {
      // Establish connection to the Solana blockchain
      const connection = new Connection(alchemyRpcUrl, "confirmed");
  
      // Decode the private key and create a Keypair
      const fromKeypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(fromPrivateKey)));
  
      // Validate addresses
      if (!PublicKey.isOnCurve(toAddress)) {
        throw new Error("Invalid recipient address");
      }
  
      // Create a transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: new PublicKey(toAddress),
          lamports: amount * 1e9, // Convert SOL to lamports
        })
      );
  
      // Specify recent blockhash to ensure transaction validity
      transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      transaction.feePayer = fromKeypair.publicKey;
  
      // Sign the transaction
      transaction.sign(fromKeypair);
  
      // Serialize and send the transaction
      const serializedTransaction = transaction.serialize();
      const signature = await connection.sendRawTransaction(serializedTransaction);
  
      // Confirm the transaction
      const confirmation = await connection.confirmTransaction(signature, "confirmed");
  
      // Check if the transaction was finalized
      if (confirmation?.value?.err) {
        throw new Error(`Transaction failed with error: ${JSON.stringify(confirmation.value.err)}`);
      }
  
      // Return success with the transaction signature
      return { success: true, signature };
    } catch (error) {
      console.error("Error transferring funds:", error);
  
      // Categorize error messages for better client feedback
      if (error.message.includes("Insufficient funds")) {
        throw new Error("Insufficient funds to complete the transaction");
      } else if (error.message.includes("Invalid recipient address")) {
        throw new Error("Invalid recipient wallet address");
      } else if (error.message.includes("Transaction failed")) {
        throw new Error("Transaction rejected by the network");
      } else {
        throw new Error("An unexpected error occurred during the transaction");
      }
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
