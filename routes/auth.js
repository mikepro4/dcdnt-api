const express = require("express");
const { login, register } = require("../controllers/authController");

const router = express.Router();

// Define your routes here
router.post("/login", login);
router.post("/register", register);

module.exports = router;
