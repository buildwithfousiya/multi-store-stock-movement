const StockEntry = require('../models/StockEntry');
const { adjustStock, transferStock } = require('../services/stockService');

const getStock = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    if (req.query.store) filter.store = req.query.store;
    if (req.query.threshold !== undefined) {
      const threshold = parseInt(req.query.threshold, 10);
      if (isNaN(threshold)) {
        return res.status(400).json({ error: 'Threshold must be a number' });
      }
      filter.quantity = { $lte: threshold };
    }

    const stockEntries = await StockEntry.find(filter)
      .populate('product', 'name sku')
      .populate('store', 'name')
      .sort({ 'product.name': 1 });

    res.json({ success: true, count: stockEntries.length, data: { stock: stockEntries } });
  } catch (error) {
    next(error);
  }
};

const adjust = async (req, res, next) => {
  try {
    const { productId, storeId, quantity } = req.body;
    if (!productId || !storeId || quantity === undefined || quantity === null) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const qty = Number(quantity);
    if (isNaN(qty) || qty === 0) {
      return res.status(400).json({error: 'Invalid quantity'});
    }

    const entry = await adjustStock(productId, storeId, qty);
    await entry.populate('product', 'name sku');
    await entry.populate('store', 'name');

    res.json({ success: true, data: { stock: entry } });
  } catch (error) {
    next(error);
  }
};

const transfer = async (req, res, next) => {
  try {
    const { productId, fromStoreId, toStoreId, quantity } = req.body;
    if (!productId || !fromStoreId || !toStoreId || !quantity) {
      return res.status(400).json({ error:'Missing fields'});
    }
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({error:'Invalid quantity'});
    }

    const result = await transferStock(productId, fromStoreId, toStoreId, qty);
    await result.from.populate('product', 'name sku');
    await result.from.populate('store', 'name');
    await result.to.populate('product', 'name sku');
    await result.to.populate('store', 'name');

    res.json({ success: true, data: { from: result.from, to: result.to } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStock, adjust, transfer };
