const express = require("express");
const { createWallet, getWallet } = require("../controllers/walletController");

const router = express.Router();

// Define your routes here
router.post("/create", createWallet);
router.get("/get", getWallet);

module.exports = router;
