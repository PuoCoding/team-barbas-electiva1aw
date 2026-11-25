const mongoose = require('mongoose');

module.exports = async function connectDatabase() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kids-zone');
};
