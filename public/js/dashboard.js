(async () => {
  const msg = document.getElementById('msg');
  const mapEl = document.getElementById('map');
  const logoutBtn = document.getElementById('logout');

  // Logout
  logoutBtn.onclick = () => {
    localStorage.removeItem('sm_token');
    window.location = 'index.html';
  };

  // Recupera token
  const token = localStorage.getItem('sm_token');
  if (!token) {
    msg.textContent = 'Usuário não autenticado. Redirecionando…';
    setTimeout(() => window.location = 'index.html', 1000);
    return;
  }

  // Busca dados
  msg.textContent = 'Buscando dados…';
  let pts;
  try {
    const res = await fetch(window.location.origin + '/api/data', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    pts = await res.json();
  } catch (e) {
    msg.textContent = 'Erro ao buscar dados: ' + e.message;
    msg.style.color = 'red';
    return;
  }

  if (!Array.isArray(pts) || pts.length === 0) {
    msg.textContent = 'Nenhum dado coletado ainda.';
    return;
  }

  // Inicia o mapa
  msg.textContent = `Plotando ${pts.length} ponto(s)…`;
  mapEl.style.display = 'block';
  const first = pts[0].location;
  const map = L.map('map').setView([first.lat, first.lng], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Plota marcadores
  pts.forEach(p => {
    const loc = p.location;
    if (loc && loc.lat != null) {
      L.marker([loc.lat, loc.lng])
       .bindPopup(`<b>${p.username}</b><br>${new Date(p.timestamp).toLocaleString()}`)
       .addTo(map);
    }
  });

  // Oculta mensagem
  msg.style.display = 'none';
})();
