const axios = require('axios');
const TokenDetails = require('../models/TokenDetails'); // Updated schema

const monitorToken = async (tokenAddress) => {
  const url = `https://api.dexscreener.com/latest/dex/search?q=${tokenAddress}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.pairs && data.pairs.length > 0) {
      const raydiumPair = data.pairs.find((pair) => pair.dexId === 'raydium');

      if (raydiumPair) {
        const existingRecord = await TokenDetails.findOne({ pairAddress: raydiumPair.pairAddress });

        if (!existingRecord) {
          const newTokenDetails = new TokenDetails({
            data: raydiumPair
          });

          await newTokenDetails.save();
          console.log(`Saved new token details for pairAddress: ${raydiumPair.pairAddress}`);
        } else {
          console.log(`Token details for pairAddress: ${raydiumPair.pairAddress} already exist. Skipping.`);
        }
      } else {
        console.log(`No "raydium" pair found for tokenAddress: ${tokenAddress}`);
      }
    } else {
      console.log(`No pairs found for tokenAddress: ${tokenAddress}`);
    }
  } catch (error) {
    console.error(`Failed to fetch data for ${tokenAddress}:`, error.message);
  }
};

module.exports = monitorToken;
