const express = require("express");
const { login, register, connectWallet } = require("../controllers/authController");

const router = express.Router();

// Define your routes here
router.post("/connect-wallet", connectWallet);
router.post("/login", login);
router.post("/register", register);

module.exports = router;
