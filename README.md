# Website Kelas X RPL C

Website sederhana untuk kelas X RPL C yang memiliki fitur:
- ✅ Absensi siswa (tersimpan di browser)
- ✅ Jadwal piket otomatis (6 siswa per hari)
- ✅ Uang kas dengan saldo dan riwayat
- ✅ Jadwal pelajaran mingguan

---

## Cara Menjalankan di GitHub Pages

1. **Login ke GitHub**
2. Buat repository baru (misal `x-rpl-c`)
3. Upload semua file ini (`index.html`, `style.css`, `script.js`, `README.md`)
4. Buka **Settings → Pages**
   - Source: `Deploy from a branch`
   - Branch: `main` dan folder `/ (root)`
5. Klik **Save** dan tunggu beberapa menit
6. Akses website di:
   ```
   https://<username>.github.io/x-rpl-c/
   ```

---

## Catatan
- Data (absensi & kas) disimpan di `localStorage` browser. Jika membersihkan data browser, data akan hilang.
- Untuk mengganti daftar siswa, buka file `script.js` dan edit array `students`.
