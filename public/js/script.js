const API = '/api';
document.getElementById('btnLogin').onclick = async () => {
  const username = document.getElementById('user').value.trim();
  if (!username) return alert('Informe username');
  // login registra o user e devolve token
  const res = await fetch(API + '/auth/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ username, password: 'ignored' })
  });
  const json = await res.json();
  if (!res.ok) return alert('Erro: '+json.error);
  localStorage.setItem('token', json.token);
  window.location = 'dashboard.html';
};
