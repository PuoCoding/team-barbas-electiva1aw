const mongoose = require('mongoose');

// Base schema for a Block
// This schema will be used as a subdocument or extended by other modules
const blockSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Can be object, string, etc
    required: true
  },
  previousHash: {
    type: String,
    default: ''
  },
  hash: {
    type: String,
    required: true
  },
  nonce: {
    type: Number,
    default: 0
  }
}, { _id: false }); // _id is false because it will often be embedded

module.exports = blockSchema;
