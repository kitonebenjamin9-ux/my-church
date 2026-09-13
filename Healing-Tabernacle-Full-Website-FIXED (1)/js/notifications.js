import { db } from './firebase.js';
import { collection, query, orderBy, limit, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const box = document.querySelector('[data-notifications]');
  const status = document.querySelector('[data-notification-status]');
  const enable = document.querySelector('[data-enable-notifications]');
  if (enable) enable.addEventListener('click', async () => {
    if (!('Notification' in window)) return alert('Notifications are not supported by this browser.');
    const p = await Notification.requestPermission();
    if (status) status.textContent = p === 'granted' ? 'Notifications enabled on this device.' : 'Permission was not granted.';
  });
  onSnapshot(query(collection(db,'notifications'), orderBy('createdAt','desc'), limit(20)), snap => {
    if (!box) return; box.innerHTML = snap.docs.map(d => { const x=d.data(); return `<article class="card"><h3>${x.title||'Church Update'}</h3><p>${x.message||''}</p></article>`; }).join('') || '<p>No notifications yet.</p>';
  }, () => { if (box) box.innerHTML='<p>Notifications will appear here when available.</p>'; });
});
