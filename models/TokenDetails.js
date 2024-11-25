const mongoose = require('mongoose');

const TokenDetailsSchema = new mongoose.Schema({
    data: {},
    created: { type: Date, default: Date.now },
});

// Post-save hook to calculate and update price changes for multiple intervals
TokenDetailsSchema.post('save', async function (doc) {
    const Token = require('./Token'); // Import the Token model
  
    try {
      const tokenAddress = doc.data.baseToken.address;
  
      // Helper function to calculate price change for a specific time interval
      const calculatePriceChange = async (minutes) => {
        const startTime = new Date(doc.created.getTime() - minutes * 60 * 1000);
  
        // Fetch the most recent previous record within the interval
        const previousDetails = await mongoose
          .model('TokenDetails')
          .findOne({
            'data.baseToken.address': tokenAddress,
            created: { $lt: doc.created, $gte: startTime },
          })
          .sort({ created: 1 }); // Sort by descending timestamp to get the latest one
  
        if (previousDetails) {
          console.log(
            `[DEBUG] Found previous record for ${minutes}m interval:`,
            {
              previousPrice: previousDetails.data.priceUsd,
              createdAt: previousDetails.created,
            }
          );
  
          const previousPrice = parseFloat(previousDetails.data.priceUsd);
          const currentPrice = parseFloat(doc.data.priceUsd);
  
          if (previousPrice !== 0) {
            const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
            return priceChange.toFixed(2);
          }
        }
  
        console.log(`[DEBUG] No previous record found for ${minutes}m interval.`);
        return null; // No previous record found
      };
  
      // Calculate price changes for different intervals
      const oneMinuteChange = await calculatePriceChange(1);
      const twoMinuteChange = await calculatePriceChange(2);
      const fiveMinuteChange = await calculatePriceChange(5);
      const tenMinuteChange = await calculatePriceChange(10);
  
      // Update the token with the calculated price changes
      await Token.findOneAndUpdate(
        { tokenAddress },
        {
          oneMinutePriceChange: oneMinuteChange,
          twoMinutePriceChange: twoMinuteChange,
          fiveMinutePriceChange: fiveMinuteChange,
          tenMinutePriceChange: tenMinuteChange,
        },
        { new: true }
      );
  
      console.log(
        `Updated price changes for token ${tokenAddress}:`,
        `1m: ${oneMinuteChange}%, 2m: ${twoMinuteChange}%, 5m: ${fiveMinuteChange}%, 10m: ${tenMinuteChange}%`
      );
    } catch (error) {
      console.error('Error calculating price changes:', error);
    }
  });
  


module.exports = mongoose.model('TokenDetails', TokenDetailsSchema);
