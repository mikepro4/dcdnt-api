const cron = require('node-cron');
const axios = require('axios');
const Token = require('../models/Token');
const { startCronForToken } = require('./cronManager');

// URL to fetch the latest token profiles
const TOKEN_PROFILES_URL = 'https://api.dexscreener.com/token-profiles/latest/v1';

// Function to fetch and add new tokens to the database
const monitorLatestTokenProfiles = async () => {
  try {
    console.log('Fetching latest token profiles...');
    const response = await axios.get(TOKEN_PROFILES_URL);
    const tokens = response.data; // Updated to match the response structure

    for (const token of tokens) {
      // Check if the token already exists in the database
      const existingToken = await Token.findOne({ tokenAddress: token.tokenAddress });

      if (!existingToken) {
        // Add new token to the database
        const newToken = new Token({
          url: token.url,
          chainId: token.chainId,
          tokenAddress: token.tokenAddress,
          icon: token.icon,
          header: token.header || null, // Some tokens may not have a header
          openGraph: token.openGraph || null, // Optional field
          description: token.description || null, // Optional field
          links: token.links || [], // Links may be empty
          isCronActive: false, // Set to false initially
        });

        await newToken.save();
        console.log(`Added new token: ${token.tokenAddress}`);

        // Optionally start a cron job for the new token immediately
        await startCronForToken(newToken);
      } else {
        // Update existing token if details have changed
        const updatedFields = {
          url: token.url,
          chainId: token.chainId,
          icon: token.icon,
          header: token.header || null,
          openGraph: token.openGraph || null,
          description: token.description || null,
          links: token.links || [],
        };

        // Only update if there are changes
        await Token.findByIdAndUpdate(existingToken._id, updatedFields, { new: true });
        console.log(`Updated token: ${token.tokenAddress}`);
      }
    }
  } catch (error) {
    console.error('Error fetching latest token profiles:', error.message);
  }
};

// Schedule the main cron job to run every 10 seconds
const startMainCronJob = () => {
  cron.schedule('*/10 * * * * *', async () => {
    await monitorLatestTokenProfiles();
  });

  console.log('Main cron job to monitor latest token profiles started.');
};

module.exports = { startMainCronJob };
