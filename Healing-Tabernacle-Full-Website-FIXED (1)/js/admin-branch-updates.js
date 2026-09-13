/* admin-branch-updates.js — lets a site admin edit each branch's
   service times and announcements from the main site's Website Updates
   page. Reads/writes Firestore doc siteSettings/branches, preserving
   each branch's static info (owned by the Website Settings page). */
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const $ = id => document.getElementById(id);
const esc = s => { const d = document.createElement("div"); d.textContent = String(s ?? ""); return d.innerHTML; };
const BRANCH_LABELS = {"mubende": "Mubende Branch", "budaka": "Budaka Branch"};
let allowed = false;
let branches = [];

function render() {
  const mount = $("branchUpdates");
  if (!mount) return;
  mount.innerHTML = branches.map((b, bi) => `
    <div class="row" style="margin-bottom:24px;">
      <h3 style="margin:0 0 10px;">${esc(BRANCH_LABELS[b.slug] || b.slug)}</h3>
      <h4 style="margin:14px 0 6px;font-size:14px;">Service Times</h4>
      <div id="svc-${bi}"></div>
      <button type="button" class="btn btn-outline on-light" data-add-svc="${bi}">+ Add Service Time</button>
      <h4 style="margin:18px 0 6px;font-size:14px;">Announcements</h4>
      <div id="ann-${bi}"></div>
      <button type="button" class="btn btn-outline on-light" data-add-ann="${bi}">+ Add Announcement</button>
    </div>`).join("");

  branches.forEach((b, bi) => {
    const svcMount = $("svc-" + bi);
    svcMount.innerHTML = (b.serviceTimes || []).map((s, i) => `
      <div class="grid" style="grid-template-columns:1fr 1fr 1fr auto;margin-bottom:8px;">
        <input data-svc="day" data-bi="${bi}" data-i="${i}" value="${esc(s.day)}" placeholder="Day">
        <input data-svc="time" data-bi="${bi}" data-i="${i}" value="${esc(s.time)}" placeholder="Time">
        <input data-svc="label" data-bi="${bi}" data-i="${i}" value="${esc(s.label)}" placeholder="Service name">
        <button type="button" class="btn danger" data-del-svc="${bi}:${i}">Delete</button>
      </div>`).join("");

    const annMount = $("ann-" + bi);
    annMount.innerHTML = (b.announcements || []).map((a, i) => `
      <div class="grid" style="grid-template-columns:150px 1fr 1fr auto;margin-bottom:8px;">
        <input data-ann="date" data-bi="${bi}" data-i="${i}" value="${esc(a.date)}" placeholder="Date">
        <input data-ann="title" data-bi="${bi}" data-i="${i}" value="${esc(a.title)}" placeholder="Title">
        <textarea data-ann="detail" data-bi="${bi}" data-i="${i}" placeholder="Details">${esc(a.detail)}</textarea>
        <button type="button" class="btn danger" data-del-ann="${bi}:${i}">Delete</button>
      </div>`).join("");
  });

  mount.querySelectorAll("[data-svc]").forEach(x => x.oninput = () => {
    branches[+x.dataset.bi].serviceTimes[+x.dataset.i][x.dataset.svc] = x.value;
  });
  mount.querySelectorAll("[data-ann]").forEach(x => x.oninput = () => {
    branches[+x.dataset.bi].announcements[+x.dataset.i][x.dataset.ann] = x.value;
  });
  mount.querySelectorAll("[data-del-svc]").forEach(btn => btn.onclick = () => {
    const [bi, i] = btn.dataset.delSvc.split(":").map(Number);
    branches[bi].serviceTimes.splice(i, 1); render();
  });
  mount.querySelectorAll("[data-del-ann]").forEach(btn => btn.onclick = () => {
    const [bi, i] = btn.dataset.delAnn.split(":").map(Number);
    branches[bi].announcements.splice(i, 1); render();
  });
  mount.querySelectorAll("[data-add-svc]").forEach(btn => btn.onclick = () => {
    branches[+btn.dataset.addSvc].serviceTimes.push({ day: "", time: "", label: "" }); render();
  });
  mount.querySelectorAll("[data-add-ann]").forEach(btn => btn.onclick = () => {
    branches[+btn.dataset.addAnn].announcements.push({ date: "", title: "", detail: "" }); render();
  });
}

onAuthStateChanged(auth, async u => {
  if (!u) return;
  try {
    const p = await getDoc(doc(db, "users", u.uid));
    const role = String(p.data()?.role || "").trim().toLowerCase();
    if (!p.exists() || !["admin", "pastor"].includes(role)) return;
    allowed = true;
    const snap = await getDoc(doc(db, "siteSettings", "branches"));
    const existing = snap.exists() ? (snap.data().list || []) : [];
    branches = Object.keys(BRANCH_LABELS).map(slug => {
      const found = existing.find(x => x.slug === slug) || {};
      return { slug, serviceTimes: found.serviceTimes || [], announcements: found.announcements || [] };
    });
    render();
  } catch (e) { console.error(e); }
});

const saveBtn = $("save");
if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    if (!allowed || !branches.length) return;
    try {
      const snap = await getDoc(doc(db, "siteSettings", "branches"));
      const existing = snap.exists() ? (snap.data().list || []) : [];
      const merged = existing.map(b => {
        const upd = branches.find(x => x.slug === b.slug);
        return upd ? { ...b, serviceTimes: upd.serviceTimes, announcements: upd.announcements } : b;
      });
      branches.forEach(upd => {
        if (!merged.find(b => b.slug === upd.slug)) {
          merged.push({ slug: upd.slug, serviceTimes: upd.serviceTimes, announcements: upd.announcements });
        }
      });
      await setDoc(doc(db, "siteSettings", "branches"), { list: merged, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) { console.error("Could not save branch updates:", e); }
  });
}
