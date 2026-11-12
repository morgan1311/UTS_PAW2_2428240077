const Petugas = require('../models/petugasModel');
const { errorHttp } = require('../middlewares/errorHandler');

exports.create = async (req, res, next) => {
  try {
    const { kode, nama } = req.body;
    const petugas = await Petugas.create({ kode, nama });
    res.status(201).json(petugas);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await Petugas.find();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await Petugas.findById(req.params.id);
    if (!data) return next(errorHttp(404, 'Petugas tidak ditemukan'));
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
