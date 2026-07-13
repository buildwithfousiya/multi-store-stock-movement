const express = require('express');
const { getStock, adjust, transfer } = require('../controllers/stockController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getStock);
router.post('/adjust', protect, adminOnly, adjust);
router.post('/transfer', protect, adminOnly, transfer);

module.exports = router;
