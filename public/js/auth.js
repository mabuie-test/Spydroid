const API = window.location.origin + '/api/auth';
const tokenKey = 'sm_token';

document.getElementById('btnLogin').onclick = async () => {
  const u = document.getElementById('u').value;
  const p = document.getElementById('p').value;
  try {
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ username:u, password:p })
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || res.status);
    localStorage.setItem(tokenKey, j.token);
    window.location = 'dashboard.html';
  } catch (e) {
    alert('Erro: ' + e.message);
  }
};

document.getElementById('showReg').onclick = () => {
  document.querySelector('.container > h1').style.display='none';
  document.getElementById('regForm').style.display='block';
};

document.getElementById('showLogin').onclick = () => {
  document.querySelector('.container > h1').style.display='block';
  document.getElementById('regForm').style.display='none';
};

document.getElementById('btnReg').onclick = async () => {
  const u = document.getElementById('ru').value;
  const p = document.getElementById('rp').value;
  try {
    const res = await fetch(API + '/register', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ username:u, password:p })
    });
    if (!res.ok) throw new Error((await res.json()).error || res.status);
    alert('Registrado com sucesso!');
    document.getElementById('showLogin').click();
  } catch (e) {
    alert('Erro: ' + e.message);
  }
};
