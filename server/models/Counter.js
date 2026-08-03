const mongoose = require('mongoose');

/**
 * Counter Schema - Stores auto-incrementing counters for generating custom unique IDs.
 */
const CounterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    value: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Counter', CounterSchema);
