function errorHttp(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan` });
}

function errorHandler(err, req, res, next) {
  // Body JSON rusak
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400 && 'body' in err)) {
    return res.status(400).json({ message: 'Format JSON tidak valid' });
  }

  // ID bukan ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = err.message.replace(/\s*for model\s*["'].*?["']/gi, '').trim();
    return res.status(400).json({ message });
  }

  // Pelanggaran Schema (ValidationError)
  if (err.name === 'ValidationError') {
    const detail = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: 'Data tidak valid',
      detail,
    });
  }

  // Nilai unik bentrok (kode 11000)
  if (err.code === 11000) {
    return res.status(409).json({ message: err.message });
  }

  // Galat yang dilempar sengaja (mis. data tidak ditemukan)
  if (err.status || err.statusCode) {
    const status = err.status || err.statusCode;
    return res.status(status).json({ message: err.message });
  }

  // Galat lain yang tidak terduga
  return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
}

module.exports = { errorHttp, notFoundHandler, errorHandler };
