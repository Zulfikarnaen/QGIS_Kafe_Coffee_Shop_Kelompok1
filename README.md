# QGIS SK-3 & SK-4 - Web GIS Kafe
## Kelompok 1

Backend API dan frontend interaktif untuk proyek SIGD dengan tema Kafe/Coffee Shop di Kecamatan Pontianak Selatan.

## 1. Teknologi
- Node.js
- Express.js
- GeoJSON
- QGIS

## 2. Struktur Folder

```text
QGIS_Kafe_Coffee_Shop_Kelompok1/
├── data/
│   ├── kafe_south.geojson
│   └── area_terras.geojson
├── public/
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## 3. Persyaratan
Pastikan sudah terpasang:
- Node.js
- npm

## 4. Instalasi

Clone repository:

```bash
git clone URL_REPOSITORY
```

Masuk ke folder proyek:

```bash
cd Kafe_Coffee_Shop
```

Instal dependencies:

```bash
npm install
```

## 5. Menjalankan Server

```bash
npm start
```

Server berjalan pada:

http://localhost:3000

## 6. Daftar Endpoint API

### A. Data Kafe
- Method: GET
- URL: `/api/data/kafe`
- Fungsi: Mengambil 18 data kafe dalam format GeoJSON.

### B. Statistik Harga
- Method: GET
- URL: `/api/stats/harga`
- Fungsi: Menghitung jumlah, total harga, dan rata-rata harga kafe berdasarkan kategori WiFi.

### C. Data Area Teras
- Method: POST
- URL: `/api/feature/terras`
- Content-Type: `application/json`
- Fungsi: Menambahkan data poligon teras baru ke file `area_terras.geojson`.

Format data POST menggunakan GeoJSON Feature dengan geometri Polygon atau MultiPolygon.

## 7. Contoh URL API

```text
GET  http://localhost:3000/api/data/kafe
GET  http://localhost:3000/api/stats/harga
POST http://localhost:3000/api/feature/terras
```

## 8. Catatan Integrasi Frontend

- Data kafe tersedia dalam format GeoJSON.
- Sistem koordinat menggunakan WGS84 (EPSG:4326).
- Koordinat GeoJSON menggunakan urutan longitude, latitude.
- Backend berjalan pada port 3000.
- Untuk pengembangan frontend terpisah, frontend dapat mengakses API melalui alamat localhost tersebut jika berjalan pada komputer yang sama.

## 9. SK-4 - Frontend Interaktif

Buka **http://localhost:3000** setelah menjalankan server. Halaman harus dibuka melalui server, bukan dengan membuka `public/index.html` langsung.

- Peta Leaflet berpusat di Pontianak Selatan (`[-0.045, 109.335]`, zoom 14), dengan TileLayer OpenStreetMap dan atribusi sumber.
- Data diambil dari `GET /api/data/kafe`. Koordinat GeoJSON `[longitude, latitude]` diubah menjadi `[latitude, longitude]` untuk Leaflet.
- Hijau berarti `wifi: "ada"`; jingga berarti `wifi: "tidak ada"`. Checkbox kedua kategori aktif saat halaman dibuka.
- State terpusat di `public/app.js`: `state = { filters: { wifi_on: true, wifi_off: true }, cluster: false }`.
- Setiap perubahan checkbox memperbarui state lalu memanggil `renderKafe()`. Fungsi ini menghapus layer sebelumnya, menyaring data, dan membangun ulang layer berdasarkan state.
- Mode awal menggunakan `L.circleMarker`. Aktifkan **Kelompokkan titik** untuk memakai `L.marker` dengan `L.divIcon` berwarna di dalam `L.markerClusterGroup`. Klik kelompok untuk memperbesar; titik yang bertumpuk dapat dipisahkan oleh fitur spiderfy plugin pada zoom maksimum.
- Klik titik untuk melihat nama, alamat, harga rata-rata dalam rupiah, jam buka, dan fasilitas Wi-Fi. Mematikan kedua kategori menampilkan peta tanpa titik.
- Tombol **Kembali ke Pontianak Selatan** mengembalikan posisi dan zoom peta tanpa mengubah filter.
- Jika API gagal, tersedia pesan kesalahan dan tombol **Coba lagi**.

Struktur frontend: `public/index.html` (halaman), `public/styles.css` (tampilan responsif), dan `public/app.js` (state, pemuatan data, serta render layer). Leaflet 1.9.4 dan MarkerCluster 1.5.3 dipasang melalui npm dan disajikan lokal di `/vendor/leaflet` dan `/vendor/markercluster`.

**Konteks data:** Validasi arsip `QGIS.zip` menunjukkan CSV mentah berisi 35 kafe, seluruhnya berada di dalam batas Pontianak Selatan yang disertakan. Proyek QGIS menyimpan filter SK-2 `harga_rata < 25000`, yang menghasilkan tepat 18 kafe (6 dengan Wi-Fi, 12 tanpa Wi-Fi). Nama, atribut asal, dan koordinat hasil filter cocok dengan GeoJSON ekspor dalam arsip. Jadi, jumlah 18 titik pada SK-4 merupakan hasil penyaringan SK-2, bukan kekurangan data mentah SK-1.

**Penggunaan offline:** Pustaka JavaScript/CSS dapat digunakan tanpa CDN setelah `npm install`, tetapi tile OpenStreetMap tetap memerlukan internet. Tanpa internet, titik, filter, popup, dan clustering tetap bekerja dengan latar peta kosong dan pesan koneksi. Peta dasar offline belum termasuk implementasi ini.

Pemeriksaan manual SK-4:

1. Saat pertama dibuka, pastikan 18 titik ditampilkan, kedua kategori dicentang, dan clustering mati.
2. Matikan **Tanpa Wi-Fi**: tampil 6 titik hijau. Tukar kategori: tampil 12 titik jingga.
3. Matikan kedua kategori: tampil 0 titik dan pesan untuk mengaktifkan kategori.
4. Ulangi kombinasi filter saat **Kelompokkan titik** aktif; jumlah kafe tetap sama dan tidak ada titik lama yang tersisa.
5. Klik titik pada kedua mode dan periksa isi popup. Klik kelompok untuk memperbesar peta.
6. Periksa halaman pada layar sempit serta pemulihan melalui **Coba lagi** ketika API sempat gagal.
