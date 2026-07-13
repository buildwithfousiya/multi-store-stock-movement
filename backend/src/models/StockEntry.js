const mongoose = require('mongoose');

const stockEntrySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store reference is required'],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock quantity cannot be negative'],
    },
  },
  { timestamps: true }
);

stockEntrySchema.index({ product: 1, store: 1 }, { unique: true });

module.exports = mongoose.model('StockEntry', stockEntrySchema);
