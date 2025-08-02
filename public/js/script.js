const API = '/api';
const container = document.querySelector('.container');
const loginForm  = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Mostrar registro ou login
document.getElementById('showRegister').onclick = e => {
  e.preventDefault();
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
};
document.getElementById('showLogin').onclick = e => {
  e.preventDefault();
  registerForm.style.display = 'none';
  loginForm.style.display = 'block';
};

// Função genérica de requisição
async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || res.status);
  return json;
}

// Login
document.getElementById('btnLogin').onclick = async () => {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  if (!username || !password) return alert('Preencha usuário e senha.');
  try {
    const { token } = await postJSON(API + '/auth/login', { username, password });
    localStorage.setItem('token', token);
    window.location.href = 'dashboard.html';
  } catch (e) {
    alert('Erro ao logar: ' + e.message);
  }
};

// Registro
document.getElementById('btnRegister').onclick = async () => {
  const username = document.getElementById('regUser').value.trim();
  const password = document.getElementById('regPass').value;
  if (!username || !password) return alert('Preencha usuário e senha.');
  try {
    await postJSON(API + '/auth/register', { username, password });
    alert('Registrado com sucesso! Faça login.');
    document.getElementById('showLogin').click();
  } catch (e) {
    alert('Erro ao registrar: ' + e.message);
  }
};
