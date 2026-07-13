const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
