const app = require('./src/app');
const { PORT } = require('./src/config/env');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

// Connect to database
connectDB();

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
