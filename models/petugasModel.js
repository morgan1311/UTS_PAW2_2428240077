const mongoose = require('mongoose');

const petugasSchema = new mongoose.Schema({
  kode: {
    type: String,
    required: [true, 'kode wajib diisi'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  nama: {
    type: String,
    required: [true, 'nama wajib diisi'],
    trim: true,
  },
});

module.exports = mongoose.model('Petugas', petugasSchema);
