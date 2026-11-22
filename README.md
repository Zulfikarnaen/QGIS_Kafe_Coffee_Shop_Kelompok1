# QGIS SK-3 - Backend API
## Kelompok 1

Backend API untuk proyek SIGD dengan tema Kafe/Coffee Shop di Kecamatan Pontianak Selatan.

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
node server.js
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
