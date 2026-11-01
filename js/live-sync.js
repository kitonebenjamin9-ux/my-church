/* Live Firebase -> public-site synchronization layer. */
import { db } from "./firebase.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

let started = false;
const has = (o,k) => Object.prototype.hasOwnProperty.call(o || {}, k);

function applySettings(s = {}) {
  if (has(s,"siteName")) CONFIG.siteName = String(s.siteName ?? "");
  if (has(s,"tagline")) CONFIG.tagline = String(s.tagline ?? "");
  if (has(s,"logo")) CONFIG.logo = String(s.logo ?? "");
  CONFIG.contact = {...(CONFIG.contact || {})};
  if (s.contact && typeof s.contact === "object") CONFIG.contact = {...CONFIG.contact, ...s.contact};
  ["address","phone","email","whatsapp","mapEmbedUrl"].forEach(k=>{if(has(s,k)) CONFIG.contact[k]=String(s[k] ?? "")});
  CONFIG.social = {...(CONFIG.social || {})};
  if (s.social && typeof s.social === "object") CONFIG.social = {...CONFIG.social, ...s.social};
  ["facebook","instagram","youtube","tiktok","whatsappLink"].forEach(k=>{if(has(s,k)) CONFIG.social[k === "whatsappLink" ? "whatsapp" : k]=String(s[k] ?? "")});
  if (has(s,"liveStreamEmbedUrl")) CONFIG.liveStreamEmbedUrl = String(s.liveStreamEmbedUrl ?? "");
  if (typeof s.liveStreamIsLive === "boolean") CONFIG.liveStreamIsLive = s.liveStreamIsLive;
  if (Array.isArray(s.serviceTimes)) CONFIG.serviceTimes = s.serviceTimes;
  if (Array.isArray(s.announcements)) CONFIG.announcements = s.announcements;
  if (s.pastor && typeof s.pastor === "object") CONFIG.pastor = {...(CONFIG.pastor||{}), ...s.pastor};
  if (s.about && typeof s.about === "object") CONFIG.about = {...(CONFIG.about||{}), ...s.about};
  if (Array.isArray(s.leadership)) CONFIG.leadership = s.leadership;
  if (typeof refreshConfigDrivenContent === "function") refreshConfigDrivenContent();
}

export function startLiveSiteSync() {
  if (started) return;
  started = true;
  try {
    onSnapshot(doc(db,"siteSettings","general"), snap => {
      if (snap.exists()) applySettings(snap.data() || {});
    }, err => console.warn("[HTM] Live settings sync unavailable", err));
  } catch (e) { console.warn("[HTM] Could not start live settings sync", e); }
}
