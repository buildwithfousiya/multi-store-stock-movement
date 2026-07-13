const express = require('express');
const { createProduct, getProducts } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getProducts)
  .post(protect, adminOnly, createProduct);

module.exports = router;
