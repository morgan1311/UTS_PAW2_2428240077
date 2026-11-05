const Pinjaman = require('../models/pinjamanModel');
const { errorHttp } = require('../middlewares/errorHandler');

exports.create = async (req, res) => {
  const allowedFields = ['noPinjaman', 'namaAnggota', 'jumlah', 'status', 'petugasId'];
  const data = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      data[field] = req.body[field];
    }
  }

  if (req.body.jaminan !== undefined) {
    if (req.body.jaminan && typeof req.body.jaminan === 'object' && !Array.isArray(req.body.jaminan)) {
      data.jaminan = {
        jenis: req.body.jaminan.jenis,
        keterangan: req.body.jaminan.keterangan,
      };
    } else {
      data.jaminan = req.body.jaminan;
    }
  }

  const pinjaman = await Pinjaman.create(data);
  res.status(201).json(pinjaman);
};

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.status !== undefined) {
    filter.status = req.query.status;
  }

  let query = Pinjaman.find(filter);

  if (req.query.sort) {
    const sortField = (req.query.sort === 'true' || req.query.sort === 'asc') ? 'jumlah' : req.query.sort;
    query = query.sort({ [sortField]: 1 });
  }

  const data = await query;
  res.status(200).json(data);
};

exports.getById = async (req, res) => {
  const data = await Pinjaman.findById(req.params.id).populate('petugasId');
  if (!data) {
    throw errorHttp(404, 'Data tidak ditemukan');
  }
  res.status(200).json(data);
};
