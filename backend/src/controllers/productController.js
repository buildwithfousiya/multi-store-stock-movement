const Product = require('../models/Product');

const createProduct = async (req, res, next) => {
  try {
    const { name, sku } = req.body;
    if (!name || !sku) {
      return res.status(400).json({ error: 'Product name and SKU required'});
    }

    const product = await Product.create({ name, sku });
    res.status(201).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: { products } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProduct, getProducts };
