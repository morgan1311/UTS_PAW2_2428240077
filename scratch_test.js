const http = require('http');
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

async function runTests() {
  // Give time for mongoose to connect
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const PORT = process.env.PORT || 3000;
  const baseUrl = `http://localhost:${PORT}`;

  function request(method, path, body, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const reqHeaders = { ...headers };
      let payload = null;

      if (body !== undefined && body !== null) {
        if (typeof body === 'string') {
          payload = body;
          if (!reqHeaders['Content-Type']) reqHeaders['Content-Type'] = 'application/json';
        } else {
          payload = JSON.stringify(body);
          reqHeaders['Content-Type'] = 'application/json';
        }
      }

      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method,
          headers: reqHeaders,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            let json = null;
            try {
              json = JSON.parse(data);
            } catch (e) {
              json = data;
            }
            resolve({ status: res.statusCode, headers: res.headers, body: json });
          });
        }
      );

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  console.log('--- Starting UTS PAW2 Tests ---');

  // Test 1: 404 Route
  const res404 = await request('GET', '/rute-tidak-ada-123');
  console.log('1. Route 404:', res404.status === 404 && res404.body.message ? 'PASS' : 'FAIL', res404.status, res404.body);

  // Test 2: Bad JSON format
  const resBadJson = await request('POST', '/petugas', '{ bad json: true ', { 'Content-Type': 'application/json' });
  console.log('2. Bad JSON Body 400:', resBadJson.status === 400 && resBadJson.body.message === 'Format JSON tidak valid' ? 'PASS' : 'FAIL', resBadJson.status, resBadJson.body);

  // Clean test database collections
  const Petugas = require('./models/petugasModel');
  const Pinjaman = require('./models/pinjamanModel');
  await Pinjaman.deleteMany({});
  await Petugas.deleteMany({});

  // Test 3: C1 POST /petugas
  const resPtg1 = await request('POST', '/petugas', { kode: 'ptg01', nama: 'Budi Santoso', extra: 'ignored' });
  console.log('3. POST /petugas 201:', resPtg1.status === 201 && resPtg1.body.kode === 'PTG01' ? 'PASS' : 'FAIL', resPtg1.status, resPtg1.body);
  const ptg1Id = resPtg1.body._id;

  // Test 4: C1 GET /petugas
  const resGetPtg = await request('GET', '/petugas');
  console.log('4. GET /petugas 200 Array:', resGetPtg.status === 200 && Array.isArray(resGetPtg.body) && resGetPtg.body.length === 1 ? 'PASS' : 'FAIL', resGetPtg.body.length);

  // Test 5: Duplicate kode Petugas (code 11000 -> 409)
  const resDupPtg = await request('POST', '/petugas', { kode: 'PTG01', nama: 'Budi Dua' });
  console.log('5. Duplicate 409:', resDupPtg.status === 409 && resDupPtg.body.message ? 'PASS' : 'FAIL', resDupPtg.status, resDupPtg.body);

  // Test 6: ValidationError Petugas (missing required fields)
  const resValPtg = await request('POST', '/petugas', {});
  console.log('6. ValidationError 400:', resValPtg.status === 400 && resValPtg.body.message === 'Data tidak valid' && Array.isArray(resValPtg.body.detail) ? 'PASS' : 'FAIL', resValPtg.body);

  // Test 7: C1 POST /pinjaman (normal + ignoring extra fields)
  const pinjamanData1 = {
    noPinjaman: "PJM-001",
    namaAnggota: "Ahmad Dahlan",
    jumlah: 5000000,
    status: "diajukan",
    jaminan: { jenis: "BPKB Motor", keterangan: "Honda Vario 2020", ignoredSubField: "abc" },
    petugasId: ptg1Id,
    fieldLuar: "tidak boleh tersimpan"
  };
  const resPjm1 = await request('POST', '/pinjaman', pinjamanData1);
  console.log('7. POST /pinjaman 201:', resPjm1.status === 201 && resPjm1.body.noPinjaman === 'PJM-001' && resPjm1.body.fieldLuar === undefined && resPjm1.body.jaminan._id === undefined ? 'PASS' : 'FAIL', resPjm1.status, resPjm1.body);
  const pjm1Id = resPjm1.body._id;

  // Add more loans for filtering and sorting
  await request('POST', '/pinjaman', {
    noPinjaman: "PJM-002",
    namaAnggota: "Siti Aminah",
    jumlah: 10000000,
    status: "disetujui",
    jaminan: { jenis: "Sertifikat Tanah", keterangan: "Luas 200m2" },
    petugasId: ptg1Id,
  });

  await request('POST', '/pinjaman', {
    noPinjaman: "PJM-003",
    namaAnggota: "Joko Widodo",
    jumlah: 2000000,
    status: "disetujui",
    jaminan: { jenis: "BPKB Mobil", keterangan: "Toyota Avanza" },
    petugasId: ptg1Id,
  });

  // Test 8: C2 GET /pinjaman (all items array)
  const resGetPjm = await request('GET', '/pinjaman');
  console.log('8. GET /pinjaman 200 Array:', resGetPjm.status === 200 && Array.isArray(resGetPjm.body) && resGetPjm.body.length === 3 ? 'PASS' : 'FAIL', resGetPjm.body.length);

  // Test 9: C3 GET /pinjaman?status=disetujui (filter)
  const resFilter = await request('GET', '/pinjaman?status=disetujui');
  console.log('9. Filter ?status=disetujui:', resFilter.status === 200 && resFilter.body.length === 2 && resFilter.body.every(p => p.status === 'disetujui') ? 'PASS' : 'FAIL', resFilter.body.length);

  // Test 10: C3 Filter not found returns []
  const resFilterNone = await request('GET', '/pinjaman?status=lunas');
  console.log('10. Filter none returns []:', resFilterNone.status === 200 && Array.isArray(resFilterNone.body) && resFilterNone.body.length === 0 ? 'PASS' : 'FAIL', resFilterNone.body);

  // Test 11: C3 Sorting ?sort=jumlah (menaik / ascending)
  const resSort = await request('GET', '/pinjaman?sort=jumlah');
  const amounts = resSort.body.map(p => p.jumlah);
  const isSorted = amounts[0] <= amounts[1] && amounts[1] <= amounts[2];
  console.log('11. Sort ?sort=jumlah (ascending):', resSort.status === 200 && isSorted ? 'PASS' : 'FAIL', amounts);

  // Test 12: C3 Filter & Sort combined ?status=disetujui&sort=jumlah
  const resFilterSort = await request('GET', '/pinjaman?status=disetujui&sort=jumlah');
  const amountsFiltered = resFilterSort.body.map(p => p.jumlah);
  console.log('12. Filter & Sort combined:', resFilterSort.status === 200 && amountsFiltered[0] === 2000000 && amountsFiltered[1] === 10000000 ? 'PASS' : 'FAIL', amountsFiltered);

  // Test 13: C4 GET /pinjaman/:id with populate
  const resGetById = await request('GET', `/pinjaman/${pjm1Id}`);
  console.log('13. GET /pinjaman/:id (populate):', resGetById.status === 200 && resGetById.body.petugasId.kode === 'PTG01' && resGetById.body.petugasId.nama === 'Budi Santoso' ? 'PASS' : 'FAIL', resGetById.body.petugasId);

  // Test 14: C4 GET /pinjaman/:id not found 404
  const fakeId = new mongoose.Types.ObjectId();
  const resNotFound = await request('GET', `/pinjaman/${fakeId}`);
  console.log('14. GET /pinjaman/:id 404:', resNotFound.status === 404 && resNotFound.body.message ? 'PASS' : 'FAIL', resNotFound.status, resNotFound.body);

  // Test 15: C4 GET /pinjaman/:id malformed ID (CastError -> 400 without model name)
  const resCast = await request('GET', '/pinjaman/bukan-object-id');
  const hasNoModel = !resCast.body.message.includes('Pinjaman');
  console.log('15. CastError 400 without model name:', resCast.status === 400 && hasNoModel ? 'PASS' : 'FAIL', resCast.status, resCast.body);

  // Test 16: Duplicate noPinjaman 409
  const resDupPjm = await request('POST', '/pinjaman', pinjamanData1);
  console.log('16. Duplicate noPinjaman 409:', resDupPjm.status === 409 && resDupPjm.body.message ? 'PASS' : 'FAIL', resDupPjm.status, resDupPjm.body);

  // Test 17: Min validation on jumlah (negative number)
  const resMinVal = await request('POST', '/pinjaman', { ...pinjamanData1, noPinjaman: 'PJM-MIN', jumlah: -500 });
  console.log('17. Min validation 400:', resMinVal.status === 400 && resMinVal.body.message === 'Data tidak valid' ? 'PASS' : 'FAIL', resMinVal.status, resMinVal.body);

  console.log('--- All tests completed ---');
  process.exit(0);
}

runTests().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
