
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Lokasi file GeoJSON
const fileKafe = path.join(__dirname, 'data', 'kafe_south.geojson');
const fileTerras = path.join(__dirname, 'data', 'area_terras.geojson');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Sajikan pustaka lokal agar frontend tidak bergantung pada CDN.
app.use('/vendor/leaflet', express.static(path.join(__dirname, 'node_modules', 'leaflet', 'dist')));
app.use('/vendor/markercluster', express.static(path.join(__dirname, 'node_modules', 'leaflet.markercluster', 'dist')));

// ======================================
// 1. GET DATA KAFE
// ======================================
app.get('/api/data/kafe', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(fileKafe, 'utf8'));

        res.json(data);
    } catch (error) {
        res.status(500).json({
            message: 'Gagal membaca data kafe',
            error: error.message
        });
    }
});

// ======================================
// 2. GET STATISTIK HARGA BERDASARKAN WIFI
// ======================================
app.get('/api/stats/harga', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(fileKafe, 'utf8'));

        const statistik = {};

        data.features.forEach(feature => {
            const properti = feature.properties;
            const wifi = properti.wifi || 'tidak diketahui';
            const harga = Number(properti.harga_rata);

            if (!Number.isFinite(harga)) return;

            if (!statistik[wifi]) {
                statistik[wifi] = {
                    jumlah_kafe: 0,
                    total_harga: 0,
                    rata_rata_harga: 0
                };
            }

            statistik[wifi].jumlah_kafe++;
            statistik[wifi].total_harga += harga;
        });

        Object.keys(statistik).forEach(wifi => {
            const item = statistik[wifi];

            item.rata_rata_harga =
                item.total_harga / item.jumlah_kafe;
        });

        res.json(statistik);
    } catch (error) {
        res.status(500).json({
            message: 'Gagal menghitung statistik harga',
            error: error.message
        });
    }
});

// ======================================
// 3. POST DATA POLIGON AREA TERAS
// ======================================
app.post('/api/feature/terras', (req, res) => {
    try {
        const fiturBaru = req.body;

        // Validasi GeoJSON Feature
        if (
            !fiturBaru ||
            fiturBaru.type !== 'Feature' ||
            !fiturBaru.geometry ||
            !['Polygon', 'MultiPolygon'].includes(
                fiturBaru.geometry.type
            )
        ) {
            return res.status(400).json({
                message: 'Data harus berupa GeoJSON Feature dengan geometri Polygon atau MultiPolygon'
            });
        }

        let koleksi;

        if (fs.existsSync(fileTerras)) {
            koleksi = JSON.parse(
                fs.readFileSync(fileTerras, 'utf8')
            );
        } else {
            koleksi = {
                type: 'FeatureCollection',
                features: []
            };
        }

        if (
            koleksi.type !== 'FeatureCollection' ||
            !Array.isArray(koleksi.features)
        ) {
            return res.status(400).json({
                message: 'Format file area_terras.geojson tidak valid'
            });
        }

        // Tambahkan fitur baru tanpa menghapus fitur lama
        koleksi.features.push(fiturBaru);

        fs.writeFileSync(
            fileTerras,
            JSON.stringify(koleksi, null, 2),
            'utf8'
        );

        res.status(201).json({
            message: 'Data area teras berhasil disimpan',
            jumlah_fitur: koleksi.features.length,
            data: fiturBaru
        });

    } catch (error) {
        res.status(500).json({
            message: 'Gagal menyimpan data area teras',
            error: error.message
        });
    }
});

// ======================================
// MENJALANKAN SERVER
// ======================================
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
