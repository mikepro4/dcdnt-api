const express = require('express');
const { addToken, removeToken, getTokens } = require('../controllers/tokenController');

const router = express.Router();

router.post('/add', addToken);       // Add a new token
router.delete('/remove/:tokenId', removeToken); // Remove a token
router.get('/list', getTokens);     // List all tokens

module.exports = router;
