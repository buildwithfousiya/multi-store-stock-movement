const express = require('express');
const { createStore, getStores } = require('../controllers/storeController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getStores)
  .post(protect, adminOnly, createStore);

module.exports = router;
