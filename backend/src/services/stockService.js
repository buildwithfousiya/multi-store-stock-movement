const StockEntry = require('../models/StockEntry');
const Product = require('../models/Product');
const Store = require('../models/Store');

const adjustStock = async (productId, storeId, quantity) => {
  if (quantity === 0) throw new Error('Quantity cannot be zero');
  if (!(await Product.exists({ _id: productId }))) throw new Error('Product not found');
  if (!(await Store.exists({ _id: storeId }))) throw new Error('Store not found');

  const query = { product: productId, store: storeId };
  if (quantity < 0) query.quantity = { $gte: Math.abs(quantity) };

  const stockEntry = await StockEntry.findOneAndUpdate(
    query,
    { $inc: { quantity } },
    { new: true, upsert: quantity > 0, runValidators: true }
  );

  if (!stockEntry) throw new Error('Insufficient stock');
  return stockEntry;
};

const transferStock = async (productId, fromStoreId, toStoreId, quantity) => {
  if (!quantity || quantity <= 0) throw new Error('Quantity must be positive');
  if (fromStoreId === toStoreId) throw new Error('Cannot transfer to same store');

  if (!(await Product.exists({ _id: productId }))) throw new Error('Product not found');
  if (!(await Store.exists({ _id: fromStoreId }))) throw new Error('Source store not found');
  if (!(await Store.exists({ _id: toStoreId }))) throw new Error('Destination store not found');

  const sourceEntry = await StockEntry.findOneAndUpdate(
    { product: productId, store: fromStoreId, quantity: { $gte: quantity } },
    { $inc: { quantity: -quantity } },
    { new: true, runValidators: true }
  );
  if (!sourceEntry) throw new Error('Insufficient stock');

  try {
    const destEntry = await StockEntry.findOneAndUpdate(
      { product: productId, store: toStoreId },
      { $inc: { quantity } },
      { new: true, upsert: true, runValidators: true }
    );
    return { from: sourceEntry, to: destEntry };
  } catch (error) {
    await StockEntry.findOneAndUpdate(
      { product: productId, store: fromStoreId },
      { $inc: { quantity } }
    );
    throw error;
  }
};

module.exports = { adjustStock, transferStock };
