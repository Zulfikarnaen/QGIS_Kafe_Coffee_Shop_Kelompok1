'use strict';

// Semua kontrol memperbarui state ini, lalu memanggil renderKafe().
const state = {
  filters: { wifi_on: true, wifi_off: true },
  cluster: false
};

const PONTIANAK_SELATAN = [-0.045, 109.335];
const INITIAL_ZOOM = 14;
const COLORS = { wifi_on: '#18775b', wifi_off: '#ce7036' };
const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0
});
const statusElement = document.getElementById('status');
const retryButton = document.getElementById('retry');
let kafeFeatures = [];
let kafeLayer = null;

const map = L.map('map', { zoomControl: false }).setView(PONTIANAK_SELATAN, INITIAL_ZOOM);
L.control.zoom({ position: 'topright' }).addTo(map);
L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
tiles.on('tileerror', () => {
  document.getElementById('tile-warning').hidden = false;
});

function wifiCategory(feature) {
  const wifi = String(feature.properties?.wifi ?? '').trim().toLowerCase();
  if (wifi === 'ada') return 'wifi_on';
  if (wifi === 'tidak ada') return 'wifi_off';
  return null;
}

function validKafe(feature) {
  const coordinates = feature.geometry?.coordinates;
  return feature.geometry?.type === 'Point' && Array.isArray(coordinates)
    && Number.isFinite(coordinates[0]) && Math.abs(coordinates[0]) <= 180
    && Number.isFinite(coordinates[1]) && Math.abs(coordinates[1]) <= 90
    && wifiCategory(feature) !== null;
}

function createPopup(feature) {
  const properties = feature.properties || {};
  const popup = document.createElement('div');
  popup.className = 'kafe-popup';
  const title = document.createElement('h2');
  title.textContent = properties.nama || 'Kafe tanpa nama';
  popup.append(title);
  const price = properties.harga_rata;
  const details = [
    properties.alamat || 'Alamat belum tersedia',
    `Harga rata-rata: ${price !== null && price !== undefined && price !== '' && Number.isFinite(Number(price)) ? rupiah.format(Number(price)) : 'Belum tersedia'}`,
    `Jam buka: ${properties.jam_buka || 'Belum tersedia'}`,
    wifiCategory(feature) === 'wifi_on' ? 'Dengan Wi-Fi' : 'Tanpa Wi-Fi'
  ];
  details.forEach((text, index) => {
    const row = document.createElement('p');
    row.textContent = text;
    if (index === 3) row.className = 'popup-wifi';
    popup.append(row);
  });
  return popup;
}

function renderKafe() {
  // Hapus grup sebelumnya agar filter dan pergantian mode tidak menggandakan titik.
  if (kafeLayer) {
    map.removeLayer(kafeLayer);
    kafeLayer.clearLayers();
  }
  kafeLayer = state.cluster
    ? L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 55 })
    : L.layerGroup();

  const visible = kafeFeatures.filter(feature => state.filters[wifiCategory(feature)]);
  visible.forEach(feature => {
    const category = wifiCategory(feature);
    // GeoJSON: [longitude, latitude]; Leaflet: [latitude, longitude].
    const [longitude, latitude] = feature.geometry.coordinates;
    const latlng = [latitude, longitude];
    let marker;
    if (state.cluster) {
      marker = L.marker(latlng, {
        title: feature.properties.nama || 'Kafe',
        icon: L.divIcon({
          className: `kafe-icon ${category === 'wifi_on' ? 'wifi-on' : 'wifi-off'}`,
          html: '', iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -9]
        })
      });
    } else {
      marker = L.circleMarker(latlng, {
        radius: 8, color: '#fff', weight: 2,
        fillColor: COLORS[category], fillOpacity: 1
      });
    }
    marker.bindPopup(createPopup(feature));
    // Elemen DOM menjaga nama kafe dari API tetap berupa teks biasa.
    const tooltip = document.createElement('span');
    tooltip.textContent = feature.properties.nama || 'Kafe';
    marker.bindTooltip(tooltip, { direction: 'top' });
    kafeLayer.addLayer(marker);
  });
  kafeLayer.addTo(map);
  document.getElementById('visible-count').textContent = visible.length;
  document.getElementById('total-count').textContent = `dari ${kafeFeatures.length} kafe`;
  statusElement.textContent = visible.length
    ? `${state.cluster ? 'Pengelompokan aktif.' : 'Titik individual aktif.'} Klik titik untuk detail kafe.`
    : 'Tidak ada kafe ditampilkan. Aktifkan kategori Wi-Fi untuk melihat titik.';
}

async function loadKafe() {
  retryButton.hidden = true;
  document.getElementById('filters').disabled = true;
  statusElement.textContent = 'Memuat data kafe…';
  try {
    const response = await fetch('/api/data/kafe');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
      throw new Error('Format data bukan GeoJSON FeatureCollection');
    }
    kafeFeatures = data.features.filter(feature => feature && validKafe(feature));
    for (const category of ['wifi_on', 'wifi_off']) {
      const count = kafeFeatures.filter(feature => wifiCategory(feature) === category).length;
      document.getElementById(category === 'wifi_on' ? 'wifi-on-count' : 'wifi-off-count').textContent = count;
    }
    renderKafe();
    if (!kafeFeatures.length) statusElement.textContent = 'Data kafe belum tersedia.';
    document.getElementById('filters').disabled = false;
  } catch (error) {
    statusElement.textContent = 'Data kafe gagal dimuat. Pastikan server berjalan, lalu coba lagi.';
    retryButton.hidden = false;
    console.error('Gagal memuat kafe:', error);
  }
}

for (const [id, category] of [['wifi-on', 'wifi_on'], ['wifi-off', 'wifi_off']]) {
  document.getElementById(id).addEventListener('change', event => {
    state.filters[category] = event.target.checked;
    renderKafe();
  });
}
document.getElementById('cluster').addEventListener('change', event => {
  state.cluster = event.target.checked;
  renderKafe();
});
document.getElementById('reset-view').addEventListener('click', () => {
  map.setView(PONTIANAK_SELATAN, INITIAL_ZOOM);
});
retryButton.addEventListener('click', loadKafe);
loadKafe();
