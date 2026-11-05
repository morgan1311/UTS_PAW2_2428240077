const mongoose = require('mongoose');

const jaminanSchema = new mongoose.Schema({
  jenis: {
    type: String,
    trim: true,
  },
  keterangan: {
    type: String,
    trim: true,
  },
}, { _id: false });

const pinjamanSchema = new mongoose.Schema({
  noPinjaman: {
    type: String,
    required: [true, 'noPinjaman wajib diisi'],
    unique: true,
    trim: true,
  },
  namaAnggota: {
    type: String,
    required: [true, 'namaAnggota wajib diisi'],
    trim: true,
  },
  jumlah: {
    type: Number,
    required: [true, 'jumlah wajib diisi'],
    min: [0, 'jumlah minimal 0'],
  },
  status: {
    type: String,
    required: [true, 'status wajib diisi'],
    trim: true,
  },
  jaminan: {
    type: jaminanSchema,
    required: [true, 'jaminan wajib diisi'],
  },
  petugasId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Petugas',
    required: [true, 'petugasId wajib diisi'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Pinjaman', pinjamanSchema);
