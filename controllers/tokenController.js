const Token = require('../models/Token');
const { startCronForToken, stopCronForToken } = require('../services/cronManager');

exports.addToken = async (req, res) => {
  try {
    const tokenData = req.body;
    const token = new Token(tokenData);
    await token.save();

    // Start cron job for the new token
    await startCronForToken(token);

    res.status(201).json({ message: 'Token added and cron job started', token });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add token', error: err.message });
  }
};

exports.removeToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    await stopCronForToken(tokenId);
    await Token.findByIdAndDelete(tokenId);

    res.status(200).json({ message: 'Token removed and cron job stopped' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove token', error: err.message });
  }
};

exports.getTokens = async (req, res) => {
  try {
    const tokens = await Token.find();
    res.status(200).json(tokens);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tokens', error: err.message });
  }
};
