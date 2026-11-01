import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

export async function loadRemoteSiteSettings() {
  try {
    const snap = await getDoc(doc(db, "siteSettings", "general"));
    if (!snap.exists()) return;

    const s = snap.data() || {};

    if (has(s, "siteName")) CONFIG.siteName = String(s.siteName ?? "");
    if (has(s, "tagline")) CONFIG.tagline = String(s.tagline ?? "");
    if (has(s, "logo")) CONFIG.logo = String(s.logo ?? "");

    if (s.contact && typeof s.contact === "object") {
      CONFIG.contact = { ...CONFIG.contact, ...s.contact };
    } else {
      if (has(s, "address")) CONFIG.contact.address = String(s.address ?? "");
      if (has(s, "phone")) CONFIG.contact.phone = String(s.phone ?? "");
      if (has(s, "email")) CONFIG.contact.email = String(s.email ?? "");
      if (has(s, "whatsapp")) CONFIG.contact.whatsapp = String(s.whatsapp ?? "");
      if (has(s, "mapEmbedUrl")) CONFIG.contact.mapEmbedUrl = String(s.mapEmbedUrl ?? "");
    }

    if (s.social && typeof s.social === "object") {
      CONFIG.social = { ...CONFIG.social, ...s.social };
    } else {
      if (has(s, "facebook")) CONFIG.social.facebook = String(s.facebook ?? "");
      if (has(s, "instagram")) CONFIG.social.instagram = String(s.instagram ?? "");
      if (has(s, "youtube")) CONFIG.social.youtube = String(s.youtube ?? "");
      if (has(s, "tiktok")) CONFIG.social.tiktok = String(s.tiktok ?? "");
      if (has(s, "whatsappLink")) CONFIG.social.whatsapp = String(s.whatsappLink ?? "");
    }

    if (has(s, "liveStreamEmbedUrl")) CONFIG.liveStreamEmbedUrl = String(s.liveStreamEmbedUrl ?? "");
    if (typeof s.liveStreamIsLive === "boolean") CONFIG.liveStreamIsLive = s.liveStreamIsLive;
    if (Array.isArray(s.serviceTimes)) CONFIG.serviceTimes = s.serviceTimes;
    if (Array.isArray(s.announcements)) CONFIG.announcements = s.announcements;

    if (s.pastor && typeof s.pastor === "object") {
      CONFIG.pastor = { ...CONFIG.pastor, ...s.pastor };
    }

    if (s.about && typeof s.about === "object") {
      CONFIG.about = { ...CONFIG.about, ...s.about };
      if (Array.isArray(s.about.coreValues)) CONFIG.about.coreValues = s.about.coreValues;
    }

    if (Array.isArray(s.leadership)) CONFIG.leadership = s.leadership;

    // Theme values are stored in Firestore by the admin platform.
    const root = document.documentElement;
    const themeMap = {
      primaryColor: "--color-primary",
      secondaryColor: "--color-secondary",
      accentColor: "--color-accent",
      themeBg: "--color-bg",
      themeBgAlt: "--color-bg-alt",
      themeText: "--color-text"
    };
    Object.entries(themeMap).forEach(([field, variable]) => {
      if (has(s, field) && s[field]) root.style.setProperty(variable, s[field]);
    });
    if (s.themeMode === "dark") {
      root.style.setProperty("--color-bg", "#111827");
      root.style.setProperty("--color-bg-alt", "#1f2937");
      root.style.setProperty("--color-text", "#F9FAFB");
      root.style.setProperty("--color-text-light", "#D1D5DB");
      root.style.setProperty("--color-border", "#374151");
    }
  } catch (e) {
    console.warn("Remote site settings unavailable; using local defaults.", e);
  }
}
