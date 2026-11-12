require('dotenv').config();
const mongoose = require('mongoose'); 
const express = require('express');
const cors = require('cors');

const logger = require('./middlewares/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const pinjamanRoutes = require('./routes/pinjamanRoute');
const petugasRoutes = require('./routes/petugasRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware global ----------
app.use(logger);
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// ---------- Route dasar ----------
app.get('/', (req, res) => {
  res.send('Server Express.js berjalan!');
});

// ---------- Route per modul ----------
app.use('/pinjaman', pinjamanRoutes);
app.use('/petugas', petugasRoutes);
app.use('/api/pinjaman', pinjamanRoutes);
app.use('/api/petugas', petugasRoutes);

// ---------- Handler 404 dan error handler (paling bawah) ----------
app.use(notFoundHandler);
app.use(errorHandler);

const mongoUri = process.env.DB_URI || process.env.MONGODB_URI;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Terhubung ke MongoDB');
    app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Gagal terhubung:', err.message);
  });

module.exports = app;