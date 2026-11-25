const mongoose = require('mongoose');

module.exports = async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kids-zone');
    console.log('MongoDB Connected...');
    return true;
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};
