require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const logger = require('./middlewares/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT;

// Middleware CORS (hanya mengizinkan process.env.CORS_ORIGIN dan method GET, POST)
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST'],
}));

// Middleware JSON body parser
app.use(express.json());

// Logger middleware
app.use(logger);

// Route dasar
app.get('/', (req, res) => {
  res.json({ message: 'Server berjalan' });
});

// Handler 404 dan error handler terpusat didaftarkan paling akhir
app.use(notFoundHandler);
app.use(errorHandler);

// Koneksi ke MongoDB: Server baru menerima request setelah koneksi berhasil
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Terhubung ke MongoDB');
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Gagal terhubung ke MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
