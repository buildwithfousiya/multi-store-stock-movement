const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const storeRoutes = require('./routes/storeRoutes');
const stockRoutes = require('./routes/stockRoutes');

connectDB();
const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/stock', stockRoutes);

app.use(errorHandler);

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
