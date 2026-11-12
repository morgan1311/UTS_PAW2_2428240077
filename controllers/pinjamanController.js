const Pinjaman = require('../models/pinjamanModel');
const { errorHttp } = require('../middlewares/errorHandler');

exports.create = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status !== undefined) {
      filter.status = req.query.status;
    }

    let query = Pinjaman.find(filter);

    // Projection: ?fields=noPinjaman,namaAnggota
    if (req.query.fields) {
      const fields = String(req.query.fields).split(',').map((f) => f.trim()).join(' ');
      query = query.select(fields);
    }

    // Sorting: ?sort=jumlah
    if (req.query.sort) {
      const sortField = (req.query.sort === 'true' || req.query.sort === 'asc') ? 'jumlah' : req.query.sort;
      const arah = sortField.startsWith('-') ? -1 : 1;
      const cleanField = sortField.replace(/^-/, '');
      query = query.sort({ [cleanField]: arah });
    }

    const data = await query;
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await Pinjaman.findById(req.params.id).populate('petugasId');
    if (!data) {
      return next(errorHttp(404, 'Data tidak ditemukan'));
    }
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await Pinjaman.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!data) return next(errorHttp(404, 'Data tidak ditemukan'));
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await Pinjaman.findByIdAndDelete(req.params.id);
    if (!data) return next(errorHttp(404, 'Data tidak ditemukan'));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
