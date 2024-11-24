const axios = require('axios');

const monitorToken = async (tokenAddress) => {
  const url = `https://api.dexscreener.com/latest/dex/search?q=${tokenAddress}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    console.log(`Fetched data for ${tokenAddress}:`, data);

    // Additional logic: Save data to the database, alert, etc.
  } catch (error) {
    console.error(`Failed to fetch data for ${tokenAddress}:`, error.message);
  }
};

module.exports = monitorToken;