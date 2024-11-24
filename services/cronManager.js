const cron = require('node-cron');
const Token = require('../models/Token');
const monitorToken = require('./monitorToken'); // Assumes you have a function to monitor token data

// In-memory storage for active cron jobs
const cronJobs = {};

/**
 * Start a cron job for a specific token.
 * @param {Object} token - Token document from the database.
 */
const startCronForToken = async (token) => {
  try {
    if (cronJobs[token._id]) {
      console.log(`Cron job for token ${token.tokenAddress} already exists.`);
      return;
    }

    // Schedule the cron job to fetch data every 10 seconds
    const job = cron.schedule('*/10 * * * * *', async () => {
      try {
        console.log(`Fetching data for token: ${token.tokenAddress}`);
        await monitorToken(token.tokenAddress); // Replace with your token monitoring logic
      } catch (error) {
        console.error(`Error monitoring token ${token.tokenAddress}:`, error);
      }
    });

    cronJobs[token._id] = job; // Store the cron job in memory
    await Token.findByIdAndUpdate(token._id, { isCronActive: true }); // Update DB to reflect active cron job
    console.log(`Started cron job for token: ${token.tokenAddress}`);
  } catch (error) {
    console.error(`Error starting cron job for token ${token.tokenAddress}:`, error);
  }
};

/**
 * Stop a cron job for a specific token.
 * @param {String} tokenId - Token ID from the database.
 */
const stopCronForToken = async (tokenId) => {
  try {
    if (cronJobs[tokenId]) {
      cronJobs[tokenId].stop(); // Stop the cron job
      delete cronJobs[tokenId]; // Remove from in-memory storage
      await Token.findByIdAndUpdate(tokenId, { isCronActive: false }); // Update DB to reflect stopped cron job
      console.log(`Stopped cron job for token ID: ${tokenId}`);
    } else {
      console.log(`No active cron job found for token ID: ${tokenId}`);
    }
  } catch (error) {
    console.error(`Error stopping cron job for token ID ${tokenId}:`, error);
  }
};

/**
 * Initialize cron jobs for all tokens marked as active in the database.
 */
const initializeCronJobs = async () => {
  try {
    const activeTokens = await Token.find({ isCronActive: true }); // Fetch tokens with active cron jobs
    console.log(`Initializing ${activeTokens.length} active cron jobs.`);
    for (const token of activeTokens) {
      await startCronForToken(token); // Start cron jobs for all active tokens
    }
  } catch (error) {
    console.error('Error initializing cron jobs:', error);
  }
};

/**
 * Restart all cron jobs (optional utility function).
 */
const restartAllCronJobs = async () => {
  try {
    console.log('Restarting all cron jobs...');
    for (const tokenId in cronJobs) {
      await stopCronForToken(tokenId); // Stop existing cron jobs
    }
    await initializeCronJobs(); // Reinitialize all cron jobs
    console.log('All cron jobs have been restarted.');
  } catch (error) {
    console.error('Error restarting all cron jobs:', error);
  }
};

module.exports = {
  startCronForToken,
  stopCronForToken,
  initializeCronJobs,
  restartAllCronJobs, // Optional, for restarting all cron jobs
};
