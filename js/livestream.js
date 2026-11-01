import { db } from './firebase.js';
import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';

// Production-ready configuration pattern: admin updates Firestore and this page updates instantly.
document.addEventListener('DOMContentLoaded', () => {
  const player = document.querySelector('[data-live-player]');
  const status = document.querySelector('[data-live-status]');
  const title = document.querySelector('[data-live-title]');
  const speaker = document.querySelector('[data-live-speaker]');
  const next = document.querySelector('[data-next-service]');
  const recent = document.querySelector('[data-recent-livestreams]');
  const set = d => {
    if (!d) return;
    const live = !!d.isLive;
    if (status) status.textContent = live ? '🔴 LIVE NOW' : 'OFFLINE — NEXT SERVICE';
    if (title) title.textContent = d.title || 'Healing Tabernacle Live Service';
    if (speaker) speaker.textContent = d.speaker || 'Healing Tabernacle Ministries';
    if (next) next.textContent = d.nextService || 'Check our service schedule for the next service.';
    if (player && d.embedUrl) { player.innerHTML = `<iframe title="Healing Tabernacle live service" src="${d.embedUrl}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`; }
    else if (player) player.innerHTML = '<div class="empty-state"><h3>We are currently offline</h3><p>The next service will appear here automatically when the church goes live.</p></div>';
    if (recent && Array.isArray(d.previousStreams)) recent.innerHTML = d.previousStreams.map(x => `<article class="card"><h3>${x.title || 'Previous Service'}</h3><p>${x.date || ''}</p>${x.url ? `<a class="btn" href="${x.url}" target="_blank" rel="noopener">Watch</a>` : ''}</article>`).join('') || '<p>No previous livestreams have been published yet.</p>';
  };
  onSnapshot(doc(db, 'siteSettings', 'livestream'), snap => set(snap.exists() ? snap.data() : null), () => set(null));
});
