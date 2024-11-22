const express = require("express");
const { connectWallet } = require("../controllers/authController");

const router = express.Router();

// Define your routes here
router.post("/connect-wallet", connectWallet);

module.exports = router;
