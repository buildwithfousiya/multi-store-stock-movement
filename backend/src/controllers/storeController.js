const Store = require('../models/Store');

const createStore = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Store name required' });
    }

    const store = await Store.create({ name });
    res.status(201).json({ success: true, data: { store } });
  } catch (error) {
    next(error);
  }
};

const getStores = async (req, res, next) => {
  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    res.json({ success: true, count: stores.length, data: { stores } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createStore, getStores };
