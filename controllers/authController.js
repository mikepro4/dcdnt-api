const User = require("../models/User");
const { generateWallet } = require("../utils/walletUtils");
const { encrypt, decrypt } = require("../utils/cryptoUtils");
const jwt = require("jsonwebtoken");

// Connect Wallet Functionality
// POST /api/auth/connect-wallet
// POST /api/auth/connect-wallet
exports.connectWallet = async (req, res) => {
    try {
      const { walletAddress } = req.body;
  
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }
  
      // Check if the user already exists in MongoDB
      let user = await User.findOne({ walletAddress });
  
      if (!user) {
        // Generate a new virtual wallet
        const virtualWallet = generateWallet();
  
        // Create a new user
        user = new User({
          walletAddress,
          virtualWalletPrivateKey: encrypt(virtualWallet.privateKey),
          virtualWalletPublicKey: virtualWallet.publicKey,
        });
  
        // Save the new user to the database
        await user.save();
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { id: user._id, walletAddress: user.walletAddress },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
  
      // Respond with the token and public key
      res.status(200).json({
        token,
        walletPublicKey: user.virtualWalletPublicKey,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

// Register Functionality
exports.register = async (req, res) => {
    try {
        const { walletAddress, password } = req.body;

        if (!walletAddress || !password) {
            return res
                .status(400)
                .json({ error: "Wallet address and password are required" });
        }

        // Check if the user already exists
        let user = await User.findOne({ walletAddress });

        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Create a new user
        const virtualWallet = generateWallet();
        user = new User({
            walletAddress,
            virtualWalletPrivateKey: encrypt(virtualWallet.privateKey),
            virtualWalletPublicKey: virtualWallet.publicKey,
            password: encrypt(password), // Encrypt and save the password
        });

        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Login Functionality
exports.login = async (req, res) => {
    try {
        const { walletAddress, password } = req.body;

        if (!walletAddress || !password) {
            return res
                .status(400)
                .json({ error: "Wallet address and password are required" });
        }

        // Check if the user exists
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Validate the password
        const decryptedPassword = decrypt(user.password);
        if (decryptedPassword !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, walletAddress: user.walletAddress },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            token,
            walletPublicKey: user.virtualWalletPublicKey,
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
