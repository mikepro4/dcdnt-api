require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const tokenRoutes = require('./routes/token');

// Import cron jobs
const { initializeCronJobs } = require('./services/cronManager');
const { startMainCronJob } = require('./services/tokenManager');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/tokens', tokenRoutes);

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Initialize existing token cron jobs
    await initializeCronJobs();

    // Start the main cron job to monitor the latest token profiles
    startMainCronJob();
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));
