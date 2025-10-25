const API_BASE = "https://你的后端服务器地址/api";

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
  });
  const data = await res.json();
  if (data.success) {
    localStorage.setItem('user', email);
    window.location.href = 'dashboard.html';
  } else alert(data.message);
}

async function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
  });
  const data = await res.json();
  alert(data.message);
}

async function loadInbox() {
  const email = localStorage.getItem('user');
  if (!email) return window.location.href = 'index.html';
  const res = await fetch(`${API_BASE}/inbox/${email}`);
  const mails = await res.json();
  const box = document.getElementById('mails');
  box.innerHTML = mails.map(m => `
    <div class="mail">
      <b>${m.subject}</b><br>
      来自：${m.from}<br>
      内容：${m.body}<hr>
    </div>`).join('');
}

async function sendMail() {
  const from = localStorage.getItem('user');
  const to = document.getElementById('to').value;
  const subject = document.getElementById('subject').value;
  const body = document.getElementById('body').value;
  const res = await fetch(`${API_BASE}/send`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ from, to, subject, body })
  });
  const data = await res.json();
  alert(data.message);
  if (data.success) window.location.href = 'dashboard.html';
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

window.onload = function() {
  if (location.pathname.endsWith('dashboard.html')) loadInbox();
}
