(async () => {
  const token = localStorage.getItem('sm_token');
  if (!token) return window.location = 'index.html';

  document.getElementById('logout').onclick = () => {
    localStorage.removeItem('sm_token');
    window.location = 'index.html';
  };

  const res = await fetch(window.location.origin + '/api/data', {
    headers: { Authorization: 'Bearer ' + token }
  });

  if (!res.ok) {
    alert('Erro ao buscar dados: ' + res.status);
    return;
  }

  const pts = await res.json();

  const map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  if (pts.length) {
    map.setView([pts[0].location.lat, pts[0].location.lng], 8);
    pts.forEach(p => {
      L.marker([p.location.lat, p.location.lng])
       .addTo(map)
       .bindPopup(`<b>${p.username}</b><br>${new Date(p.timestamp).toLocaleString()}`);
    });
  } else {
    alert('Nenhum dado para este usuário.');
  }
})();
