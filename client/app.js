const API = 'http://localhost:4000/api';
let token = null;

document.getElementById('signup').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(API + '/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const data = await res.json();
  if (data.token) token = data.token;
  alert('Signed up');
};

document.getElementById('login').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(API + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    alert('Logged in');
  } else alert('Login failed');
};

document.getElementById('uploadBtn').onclick = async () => {
  const fileEl = document.getElementById('file');
  if (!fileEl.files.length) return alert('Select file');
  const form = new FormData();
  form.append('file', fileEl.files[0]);
  form.append('title', document.getElementById('title').value);
  form.append('artist', document.getElementById('artist').value);
  const res = await fetch(API + '/tracks/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form });
  const data = await res.json();
  alert(data._id ? 'Uploaded' : JSON.stringify(data));
};

async function load(q = '') {
  const res = await fetch(API + '/tracks' + (q ? '?q=' + encodeURIComponent(q) : ''));
  const tracks = await res.json();
  const ul = document.getElementById('tracks');
  ul.innerHTML = '';
  tracks.forEach(t => {
    const li = document.createElement('li');
    const a = document.createElement('button');
    a.textContent = (t.title || 'untitled') + ' — ' + (t.artist || '');
    a.onclick = () => { document.getElementById('player').src = API + '/tracks/' + t._id + '/stream'; };
    li.appendChild(a);
    ul.appendChild(li);
  });
}

document.getElementById('searchBtn').onclick = () => load(document.getElementById('q').value);
load();
