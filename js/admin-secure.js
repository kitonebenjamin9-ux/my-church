import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const $ = (s) => document.querySelector(s);
const esc = (v) => { const d = document.createElement("div"); d.textContent = String(v ?? ""); return d.innerHTML; };
const millis = (v) => { try { return v?.toMillis?.() || (v ? new Date(v).getTime() : 0) || 0; } catch { return 0; } };
const date = (v) => { const n = millis(v); return n ? new Date(n).toLocaleString() : "Date unavailable"; };
const json = (v) => JSON.stringify(v ?? {}, (k,val) => typeof val?.toDate === "function" ? val.toDate().toISOString() : val, 2);

const EXCLUDED = new Set(["siteSettings", "announcements", "mediaLibrary"]);
const COLLECTIONS = [
  ["contactMessages", "Contact Messages", "✉️"],
  ["prayerRequests", "Prayer Requests", "🙏"],
  ["eventRegistrations", "Event Registrations", "📅"],
  ["registrations", "General Registrations", "📝"],
  ["users", "Members", "👥"],
  ["videoTestimonies", "Video Testimonies", "🎥"],
  ["notifications", "Notifications", "🔔"],
  ["events", "Events", "📆"],
  ["sermons", "Sermons", "🎙️"],
  ["branches", "Branches", "⛪"],
  ["ministries", "Ministries", "🤝"],
  ["ministryLeaders", "Ministry Leaders", "👤"],
  ["dailyVerses", "Daily Verses", "📖"],
  ["gallery", "Gallery Records", "🖼️"],
  ["heroVideos", "Hero Videos", "🎬"],
  ["churchProject", "Church Project", "🏗️"]
];


const gate = $("#secure-gate");
const app = $("#secure-app");
const unlockForm = $("#unlock-form");
const passwordInput = $("#unlock-password");
const unlockMessage = $("#unlock-message");
const tabs = $("#secure-tabs");
const panel = $("#secure-panel");
const stats = $("#secure-stats");
const secureUser = $("#secure-user");
let currentUser = null;
let active = new URLSearchParams(location.search).get("tab") || "contactMessages";
if (!COLLECTIONS.some(([name]) => name === active)) active = "contactMessages";
let cache = {};
let unsubscribers = [];

function setMessage(text, type = "error") {
  unlockMessage.textContent = text;
  unlockMessage.className = `secure-message ${type}`;
}

function clearListeners() {
  unsubscribers.forEach((fn) => { try { fn(); } catch {} });
  unsubscribers = [];
}

function lockRecords() {
  clearListeners();
  sessionStorage.removeItem("htm_secure_records_unlocked");
  app.hidden = true;
  gate.hidden = false;
  passwordInput.value = "";
  setMessage("");
  panel.innerHTML = "";
}

async function verifyAdmin(user) {
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || !(["admin","pastor"].includes(String(snap.data()?.role || "").trim().toLowerCase()))) {
    await signOut(auth);
    throw new Error("This secure records area is available only to administrator or pastor accounts.");
  }
  return snap.data();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }
  currentUser = user;
  try {
    const profile = await verifyAdmin(user);
    secureUser.textContent = `Administrator: ${profile.name || user.displayName || user.email}`;
  } catch (error) {
    setMessage(error.message || "Administrator verification failed.");
    unlockForm.querySelector("button").disabled = true;
  }
});

unlockForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) return;
  const password = passwordInput.value;
  if (!password) return setMessage("Enter your administrator password.");

  const button = unlockForm.querySelector("button");
  button.disabled = true;
  button.textContent = "Verifying…";
  setMessage("Checking your administrator credentials…", "info");

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
    sessionStorage.setItem("htm_secure_records_unlocked", String(Date.now()));
    gate.hidden = true;
    app.hidden = false;
    setMessage("");
    passwordInput.value = "";
    startSecureRecords();
  } catch (error) {
    console.error("Secure records unlock failed", error);
    if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      setMessage("Incorrect administrator password.");
    } else {
      setMessage("The password could not be verified. Please sign in again if the problem continues.");
    }
  } finally {
    button.disabled = false;
    button.textContent = "Unlock Secure Records";
  }
});

$("#lock-button").addEventListener("click", lockRecords);

function startSecureRecords() {
  clearListeners();
  cache = {};
  COLLECTIONS.forEach(([name]) => {
    const unsubscribe = onSnapshot(collection(db, name), (snapshot) => {
      cache[name] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      cache[name].sort((a,b) => millis(b.createdAt || b.updatedAt || b.date) - millis(a.createdAt || a.updatedAt || a.date));
      renderTabs();
      renderStats();
      renderPanel();
    }, (error) => {
      console.error(`Secure ${name} listener`, error);
      cache[name] = cache[name] || [];
      renderPanel();
    });
    unsubscribers.push(unsubscribe);
  });
  renderTabs();
  renderStats();
  renderPanel();
}

function renderStats() {
  const important = ["contactMessages", "prayerRequests", "eventRegistrations", "registrations", "users", "videoTestimonies"];
  stats.innerHTML = important.map((name) => {
    const meta = COLLECTIONS.find((x) => x[0] === name);
    return `<div class="secure-stat"><span>${meta?.[2] || "•"}</span><strong>${cache[name]?.length || 0}</strong><small>${esc(meta?.[1] || name)}</small></div>`;
  }).join("");
}

function renderTabs() {
  tabs.innerHTML = COLLECTIONS.map(([name, label, icon]) => {
    const count = cache[name]?.length || 0;
    return `<button type="button" class="secure-tab ${active === name ? "active" : ""}" data-tab="${name}" role="tab" aria-selected="${active === name}">${icon} ${esc(label)} <b>${count}</b></button>`;
  }).join("");
  tabs.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => { active = button.dataset.tab; renderTabs(); renderPanel(); });
  });
}

function renderPanel() {
  const meta = COLLECTIONS.find((x) => x[0] === active);
  const rows = cache[active] || [];
  if (!meta) return;

  if (active === "contactMessages") return renderContacts(rows);
  if (active === "prayerRequests") return renderPrayers(rows);
  if (active === "eventRegistrations") return renderEventRegistrations(rows);
  if (active === "registrations") return renderGeneric(rows, meta[1], ["name", "email", "phone", "message", "status", "createdAt"]);
  if (active === "users") return renderGeneric(rows, meta[1], ["name", "email", "role", "createdAt"]);
  if (active === "videoTestimonies") return renderTestimonies(rows);
  return renderGeneric(rows, meta[1]);
}

function panelHeader(title, description, extra = "") {
  return `<div class="secure-panel-head"><div><h2>${esc(title)}</h2><p>${esc(description)}</p></div>${extra}</div>`;
}

function renderContacts(rows) {
  const q = `<input class="secure-search" id="secure-search" type="search" placeholder="Search name, email, subject or message…">`;
  panel.innerHTML = panelHeader("Contact Messages", `${rows.length} message${rows.length === 1 ? "" : "s"} received from the public contact form.`, q) + `<div id="secure-list" class="secure-list"></div>`;
  const list = panel.querySelector("#secure-list");
  const draw = () => {
    const term = panel.querySelector("#secure-search").value.trim().toLowerCase();
    const filtered = rows.filter((x) => !term || [x.name,x.email,x.phone,x.subject,x.message,x.status].some(v => String(v || "").toLowerCase().includes(term)));
    list.innerHTML = filtered.length ? filtered.map((x) => `
      <article class="secure-record">
        <div class="secure-record-head"><div><h3>${esc(x.subject || "General Inquiry")}</h3><p><strong>${esc(x.name || "Unknown sender")}</strong> · ${esc(x.email || "No email")}${x.phone ? ` · ${esc(x.phone)}` : ""}</p></div><span class="secure-badge ${String(x.status || "new").toLowerCase()}">${esc(x.status || "new")}</span></div>
        <p class="secure-message-body">${esc(x.message || "")}</p>
        <small>Received: ${esc(date(x.createdAt))}</small>
        <div class="secure-actions">
          ${x.email ? `<a class="admin-btn secondary" href="mailto:${encodeURIComponent(x.email)}?subject=${encodeURIComponent("Re: " + (x.subject || "Your message to Healing Tabernacle"))}">✉️ Email</a>` : ""}
          <button class="admin-btn secondary" data-message-action="read" data-id="${esc(x.id)}">Mark Read</button>
          <button class="admin-btn secondary" data-message-action="replied" data-id="${esc(x.id)}">Mark Replied</button>
          <button class="admin-btn danger" data-message-action="delete" data-id="${esc(x.id)}">Delete</button>
        </div>
      </article>`).join("") : `<div class="empty-state">No contact messages match your search.</div>`;
  };
  draw();
  panel.querySelector("#secure-search").addEventListener("input", draw);
  panel.querySelectorAll("[data-message-action]").forEach((b) => b.addEventListener("click", () => handleContactAction(b.dataset.messageAction, b.dataset.id)));
}

async function handleContactAction(action, id) {
  try {
    if (action === "delete") {
      if (!confirm("Delete this contact message permanently?")) return;
      await deleteDoc(doc(db, "contactMessages", id));
      return;
    }
    await updateDoc(doc(db, "contactMessages", id), { status: action, updatedAt: serverTimestamp() });
  } catch (error) { console.error(error); alert("Could not update this message."); }
}

function renderPrayers(rows) {
  panel.innerHTML = panelHeader("Prayer Requests", `${rows.length} prayer request${rows.length === 1 ? "" : "s"} in the ministry inbox.`) + `<div class="secure-list">${rows.length ? rows.map((x) => `
    <article class="secure-record">
      <div class="secure-record-head"><div><h3>${esc(x.name || "Member")}</h3><p>${esc(x.email || "No email")} · ${esc(x.category || "Other")}</p></div><span class="secure-badge">${esc(x.status || "Pending")}</span></div>
      <p><strong>Request:</strong></p><p class="secure-message-body">${esc(x.request || "")}</p>
      <p><strong>Private:</strong> ${x.isPrivate ? "Yes" : "No"} · <strong>Prayer partner:</strong> ${x.wantsPrayerPartner ? "Requested" : "No"}</p>
      ${x.pastorReply ? `<div class="secure-reply"><strong>Pastor reply:</strong><p>${esc(x.pastorReply)}</p><small>${esc(date(x.repliedAt))}</small></div>` : ""}
      <small>Submitted: ${esc(date(x.createdAt))}</small>
      <div class="secure-actions"><button class="admin-btn secondary" data-prayer="reply" data-id="${esc(x.id)}">💬 Reply</button><button class="admin-btn secondary" data-prayer="handled" data-id="${esc(x.id)}">Mark Handled</button><button class="admin-btn secondary" data-prayer="pending" data-id="${esc(x.id)}">Mark Pending</button><button class="admin-btn danger" data-prayer="delete" data-id="${esc(x.id)}">Delete</button></div>
    </article>`).join("") : `<div class="empty-state">No prayer requests yet.</div>`}</div>`;
  panel.querySelectorAll("[data-prayer]").forEach((b) => b.addEventListener("click", () => handlePrayerAction(b.dataset.prayer, b.dataset.id)));
}

async function handlePrayerAction(action, id) {
  try {
    const ref = doc(db, "prayerRequests", id);
    if (action === "delete") { if (!confirm("Delete this prayer request permanently?")) return; await deleteDoc(ref); return; }
    if (action === "reply") {
      const reply = prompt("Write the pastor/prayer-team reply:");
      if (!reply?.trim()) return;
      await updateDoc(ref, { pastorReply: reply.trim(), repliedAt: serverTimestamp(), status: "Praying" });
      return;
    }
    await updateDoc(ref, { status: action === "handled" ? "Handled" : "Pending", updatedAt: serverTimestamp() });
  } catch (error) { console.error(error); alert("Could not update this prayer request."); }
}

function renderEventRegistrations(rows) {
  panel.innerHTML = panelHeader("Event Registrations", `${rows.length} event registration${rows.length === 1 ? "" : "s"} received.`) + `<div class="secure-list">${rows.length ? rows.map((x) => `<article class="secure-record"><h3>${esc(x.eventTitle || "Event")}</h3><p><strong>Name:</strong> ${esc(x.name || "")} · <strong>Guests:</strong> ${esc(x.guests || 1)}</p><p><strong>Email:</strong> ${esc(x.email || "")}${x.phone ? ` · <strong>Phone:</strong> ${esc(x.phone)}` : ""}</p>${x.notes ? `<p><strong>Notes:</strong> ${esc(x.notes)}</p>` : ""}<p><strong>Confirmation:</strong> ${esc(x.confirmationCode || "—")} · <strong>Status:</strong> ${esc(x.status || "confirmed")}</p><small>Registered: ${esc(date(x.createdAt))}</small><div class="secure-actions"><button class="admin-btn danger" data-reg-delete="${esc(x.id)}">Delete</button></div></article>`).join("") : `<div class="empty-state">No event registrations yet.</div>`}</div>`;
  panel.querySelectorAll("[data-reg-delete]").forEach((b) => b.addEventListener("click", async () => { if (!confirm("Delete this registration permanently?")) return; try { await deleteDoc(doc(db, "eventRegistrations", b.dataset.regDelete)); } catch (e) { console.error(e); alert("Could not delete registration."); } }));
}

function renderTestimonies(rows) {
  panel.innerHTML = panelHeader("Video Testimonies", `${rows.length} testimony submission${rows.length === 1 ? "" : "s"}.`) + `<div class="secure-list">${rows.length ? rows.map((x) => `<article class="secure-record"><div class="secure-record-head"><div><h3>${esc(x.name || "Church Family")}</h3><p>${esc(x.branch || "Healing Tabernacle")} · ${esc(x.date || date(x.createdAt))}</p></div><span class="secure-badge">${esc(x.status || "pending")}</span></div>${x.videoUrl ? `<video controls preload="metadata" src="${esc(x.videoUrl)}" style="width:100%;max-height:420px;background:#000;border-radius:12px"></video>` : ""}<p>${esc(x.description || x.message || "")}</p><div class="secure-actions"><button class="admin-btn secondary" data-video="approved" data-id="${esc(x.id)}">Approve</button><button class="admin-btn secondary" data-video="rejected" data-id="${esc(x.id)}">Reject</button><button class="admin-btn secondary" data-video="archived" data-id="${esc(x.id)}">Archive</button><button class="admin-btn danger" data-video="delete" data-id="${esc(x.id)}">Delete</button></div></article>`).join("") : `<div class="empty-state">No video testimonies yet.</div>`}</div>`;
  panel.querySelectorAll("[data-video]").forEach((b) => b.addEventListener("click", () => handleVideoAction(b.dataset.video, b.dataset.id)));
}
async function handleVideoAction(action, id) {
  try { const ref = doc(db, "videoTestimonies", id); if (action === "delete") { if (!confirm("Delete this testimony permanently?")) return; await deleteDoc(ref); return; } await updateDoc(ref, { status: action, reviewedAt: serverTimestamp() }); } catch (e) { console.error(e); alert("Could not update testimony."); }
}

function renderGeneric(rows, title, fields = null) {
  const shown = rows.length ? rows.map((x) => {
    const keys = fields || Object.keys(x).filter((k) => k !== "id").slice(0, 8);
    const details = keys.map((k) => {
      const value = x[k];
      if (value === undefined || value === null || value === "") return "";
      return `<div class="secure-detail"><strong>${esc(k)}:</strong> <span>${esc(typeof value === "object" ? json(value) : value)}</span></div>`;
    }).filter(Boolean).join("");
    return `<article class="secure-record"><div class="secure-record-head"><h3>${esc(x.name || x.title || x.eventTitle || x.reference || x.id)}</h3><small>${esc(date(x.createdAt || x.updatedAt || x.date))}</small></div>${details}<details><summary>View complete record</summary><pre>${esc(json(x))}</pre></details></article>`;
  }).join("") : `<div class="empty-state">No ${esc(title.toLowerCase())} records found.</div>`;
  panel.innerHTML = panelHeader(title, `${rows.length} record${rows.length === 1 ? "" : "s"}.`) + `<div class="secure-list">${shown}</div>`;
}
