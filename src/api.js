// API helper with socket.io connection
const API_BASE = window.__API_BASE__ || 'http://localhost:4000';
function getToken(){ return localStorage.getItem('aegis_token'); }
function getUser(){ try{ return JSON.parse(localStorage.getItem('aegis_user')); }catch(e){return null;} }
async function apiFetch(path, opts={}){
  const headers = opts.headers || {}; headers['Content-Type'] = 'application/json';
  const token = getToken(); if(token) headers['Authorization'] = 'Bearer ' + token;
  opts.headers = headers;
  const res = await fetch(API_BASE + path, opts);
  if (res.status === 401) throw new Error('Unauthorized');
  return res.json();
}
function showAlert(container, message, type='success'){ container.innerHTML = `<div class="p-2 rounded ${type==='success'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}">${message}</div>`; setTimeout(()=>container.innerHTML='',4000); }
