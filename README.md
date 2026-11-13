# UTS Pengembangan Aplikasi Web II - Koperasi Simpan Pinjam (Pinjaman)

**Identitas Mahasiswa:**
- **Nama:** Muhammad Ammar Shadiq
- **NIM:** 2428240077
- **Kelas:** SI5B
- **Topik:** Koperasi Simpan Pinjam (Pinjaman)
- **Basis Data:** MongoDB (Mongoose ODM)

---

## 1. Alasan Desain Data Model (Pola Akses Data)

Berikut adalah alasan pemilihan pola relasi data pada perancangan basis data NoSQL (MongoDB):

| Data | Pola | Alasan Berdasarkan Pola Akses Data |
| :--- | :--- | :--- |
| **`jaminan`** | **Embedding** | Data jaminan selalu diakses, dibaca, dan diperbarui bersamaan dengan dokumen pinjaman terkait (relasi kepemilikan 1:1). Embedding menghindari overhead operasi *join/lookup* sehingga operasi baca detail pinjaman menjadi lebih cepat dan efisien. |
| **`petugas`** | **Referencing** | Satu petugas menangani banyak transaksi pinjaman (relasi 1:N). Pola referencing (`petugasId`) digunakan untuk mencegah redundansi (duplikasi) data profil petugas pada setiap data pinjaman, serta memastikan konsistensi data petugas jika terjadi perubahan tanpa harus memperbarui ribuan dokumen transaksi pinjaman. |

---

## 2. Struktur Data Model

### A. Model Petugas (`models/petugasModel.js`)
- `kode` : String (Wajib, Unik, Huruf Kapital, Trim)
- `nama` : String (Wajib, Trim)

### B. Model Pinjaman (`models/pinjamanModel.js`)
- `noPinjaman` : String (Wajib, Unik, Trim)
- `namaAnggota` : String (Wajib, Trim)
- `jumlah` : Number (Wajib, Minimal 0)
- `status` : String (Wajib, Trim, Contoh: "diajukan", "disetujui", "lunas")
- `jaminan` : Subdocument Schema (*Embedding*)
  - `jenis` : String
  - `keterangan` : String
- `petugasId` : ObjectId (Ref ke `Petugas`, Wajib)
- `createdAt` : Date (Bawaan: `Date.now`)

---

## 3. Daftar Endpoint API

### Modul Petugas (`/petugas`)
| Method | Endpoint | Deskripsi | Status Sukses |
| :--- | :--- | :--- | :--- |
| `POST` | `/petugas` | Menambahkan data petugas baru | `201 Created` |
| `GET` | `/petugas` | Mengambil seluruh daftar petugas | `200 OK` |
| `GET` | `/petugas/:id` | Mengambil detail petugas berdasarkan `_id` | `200 OK` |

### Modul Pinjaman (`/pinjaman`)
| Method | Endpoint | Deskripsi | Status Sukses |
| :--- | :--- | :--- | :--- |
| `POST` | `/pinjaman` | Menambahkan transaksi pinjaman baru | `201 Created` |
| `GET` | `/pinjaman` | Mengambil semua transaksi pinjaman (Mendukung filter, sort, & projection) | `200 OK` |
| `GET` | `/pinjaman?status=disetujui` | Filter pinjaman berdasarkan nilai `status` | `200 OK` |
| `GET` | `/pinjaman?sort=jumlah` | Mengurutkan pinjaman berdasarkan nilai `jumlah` (menaik/ascending) | `200 OK` |
| `GET` | `/pinjaman?fields=noPinjaman,namaAnggota` | Memilih field tertentu saja yang ditampilkan (*projection*) | `200 OK` |
| `GET` | `/pinjaman/:id` | Mengambil detail pinjaman beserta data `petugasId` yang di-*populate* | `200 OK` |
| `PUT` | `/pinjaman/:id` | Memperbarui data pinjaman berdasarkan `_id` | `200 OK` |
| `DELETE` | `/pinjaman/:id` | Menghapus data transaksi pinjaman berdasarkan `_id` | `204 No Content` |

---

## 4. Cara Menjalankan Proyek

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18+)
- [MongoDB](https://www.mongodb.com/) (Service MongoDB lokal atau MongoDB Atlas aktif)

### Langkah Instalasi & Menjalankan Server
1. **Klon atau buka folder repositori:**
   ```bash
   cd c:/PAW/SI5B-Express/UTS_PAW2_2428240077
   ```

2. **Pasang dependensi proyek:**
   ```bash
   npm install
   ```

3. **Konfigurasi file `.env`:**
   Pastikan file `.env` sudah dibuat (salin dari `.env.example`):
   ```env
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   DB_URI=mongodb://localhost:27017/UTS_PAW2_2428240077
   ```

4. **Jalankan server aplikasi:**
   - Mode Development (Nodemon):
     ```bash
     npm run dev
     ```
   - Mode Production:
     ```bash
     npm start
     ```
   Server akan berjalan pada `http://localhost:3000` dengan pesan konfirmasi:
   ```
   Terhubung ke MongoDB
   Server berjalan di http://localhost:3000
   ```
