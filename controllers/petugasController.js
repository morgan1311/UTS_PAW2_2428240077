const Petugas = require('../models/petugasModel');

exports.create = async (req, res) => {
  const { kode, nama } = req.body;
  const petugas = await Petugas.create({ kode, nama });
  res.status(201).json(petugas);
};

exports.getAll = async (req, res) => {
  const data = await Petugas.find();
  res.status(200).json(data);
};
