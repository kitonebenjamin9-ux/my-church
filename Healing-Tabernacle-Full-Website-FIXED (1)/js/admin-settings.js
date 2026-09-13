import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
let allowed = false;
let values = [];
let leaders = [];

const msg = (text, error = false) => {
  const m = $("message");
  m.className = "notice " + (error ? "err" : "ok");
  m.textContent = text;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const esc = (value) => {
  const d = document.createElement("div");
  d.textContent = String(value ?? "");
  return d.innerHTML;
};

function renderValues() {
  $("values").innerHTML = values.map((v, i) => `
    <div class="leader-row">
      <div class="leader-head"><strong>Core Value ${i + 1}</strong>
        <button type="button" class="btn danger" data-del-value="${i}">Delete</button>
      </div>
      <div class="grid">
        <div class="field"><label>Name</label><input data-value-title="${i}" value="${esc(v.title)}"></div>
        <div class="field"><label>Description</label><textarea data-value-text="${i}">${esc(v.text)}</textarea></div>
      </div>
    </div>`).join("");

  document.querySelectorAll("[data-del-value]").forEach(b =>
    b.onclick = () => { values.splice(+b.dataset.delValue, 1); renderValues(); });
  document.querySelectorAll("[data-value-title]").forEach(x =>
    x.oninput = () => values[+x.dataset.valueTitle].title = x.value);
  document.querySelectorAll("[data-value-text]").forEach(x =>
    x.oninput = () => values[+x.dataset.valueText].text = x.value);
}

function renderLeaders() {
  $("leaders").innerHTML = leaders.map((l, i) => `
    <div class="leader-row">
      <div class="leader-head"><strong>Leader ${i + 1}</strong>
        <button type="button" class="btn danger" data-del-leader="${i}">Delete</button>
      </div>
      <div class="leader-grid">
        <div class="field"><label>Name</label><input data-leader-name="${i}" value="${esc(l.name)}"></div>
        <div class="field"><label>Role</label><input data-leader-role="${i}" value="${esc(l.role)}"></div>
        <div class="field"><label>Photo URL / Path</label><input data-leader-image="${i}" value="${esc(l.image)}"><div class="help">Example: assets/images/pastor.jpg</div></div>
        <div class="field"><label>Biography</label><textarea data-leader-bio="${i}">${esc(l.bio)}</textarea></div>
      </div>
    </div>`).join("");

  document.querySelectorAll("[data-del-leader]").forEach(b =>
    b.onclick = () => { leaders.splice(+b.dataset.delLeader, 1); renderLeaders(); });
  document.querySelectorAll("[data-leader-name]").forEach(x =>
    x.oninput = () => leaders[+x.dataset.leaderName].name = x.value);
  document.querySelectorAll("[data-leader-role]").forEach(x =>
    x.oninput = () => leaders[+x.dataset.leaderRole].role = x.value);
  document.querySelectorAll("[data-leader-image]").forEach(x =>
    x.oninput = () => leaders[+x.dataset.leaderImage].image = x.value);
  document.querySelectorAll("[data-leader-bio]").forEach(x =>
    x.oninput = () => leaders[+x.dataset.leaderBio].bio = x.value);
}

function fill(s) {
  const base = {
    siteName: CONFIG.siteName,
    tagline: CONFIG.tagline,
    logo: CONFIG.logo,
    address: CONFIG.contact.address,
    phone: CONFIG.contact.phone,
    email: CONFIG.contact.email,
    whatsapp: CONFIG.contact.whatsapp,
    mapEmbedUrl: CONFIG.contact.mapEmbedUrl,
    facebook: CONFIG.social.facebook,
    instagram: CONFIG.social.instagram,
    youtube: CONFIG.social.youtube,
    tiktok: CONFIG.social.tiktok,
    whatsappLink: CONFIG.social.whatsapp,
    liveStreamEmbedUrl: CONFIG.liveStreamEmbedUrl,
    liveStreamIsLive: CONFIG.liveStreamIsLive,
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
    themeMode: "light",
    pastorName: CONFIG.pastor.name,
    pastorTitle: CONFIG.pastor.title,
    pastorImage: CONFIG.pastor.image,
    pastorBio: CONFIG.pastor.bio,
    pastorQuote: CONFIG.pastor.quote,
    storyTitle: CONFIG.about?.storyTitle,
    storyText1: CONFIG.about?.storyText1,
    storyText2: CONFIG.about?.storyText2,
    vision: CONFIG.about?.vision,
    mission: CONFIG.about?.mission,
    governance: CONFIG.about?.governance
  };
  const v = { ...base, ...s };

  [
    "siteName","tagline","logo","address","phone","email","whatsapp","mapEmbedUrl",
    "facebook","instagram","youtube","tiktok","whatsappLink","liveStreamEmbedUrl",
    "pastorName","pastorTitle","pastorImage","pastorBio","pastorQuote",
    "storyTitle","storyText1","storyText2","vision","mission","governance",
    "primaryColor","secondaryColor","accentColor"
  ].forEach(id => $(id).value = v[id] ?? "");

  $("liveStreamIsLive").checked = !!v.liveStreamIsLive;
  if ($("themeMode")) $("themeMode").value = v.themeMode || "light";

  values = Array.isArray(v.about?.coreValues) ? v.about.coreValues :
    (Array.isArray(s.coreValues) ? s.coreValues : (CONFIG.about?.coreValues || []));
  leaders = Array.isArray(v.leadership) ? v.leadership : (CONFIG.leadership || []);
  renderValues();
  renderLeaders();
}

onAuthStateChanged(auth, async (u) => {
  if (!u) {
    location.href = "admin-login.html";
    return;
  }
  try {
    const p = await getDoc(doc(db, "users", u.uid));
    const role = String(p.data()?.role || "").trim().toLowerCase();
    if (!p.exists() || !["admin", "pastor"].includes(role)) {
      msg("Access denied.", true);
      return;
    }
    allowed = true;
    $("adminInfo").textContent = `Administrator: ${p.data()?.name || u.email}`;
    const snap = await getDoc(doc(db, "siteSettings", "general"));
    fill(snap.exists() ? snap.data() : {});
  } catch (e) {
    console.error(e);
    msg("Could not load settings: " + (e.message || ""), true);
  }
});

$("addValue").onclick = () => { values.push({ title: "", text: "" }); renderValues(); };
$("addLeader").onclick = () => { leaders.push({ name: "", role: "", bio: "", image: "assets/images/pastor.jpg" }); renderLeaders(); };

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!allowed) return;

  const d = {
    siteName: $("siteName").value.trim(),
    tagline: $("tagline").value.trim(),
    logo: $("logo").value.trim(),
    address: $("address").value.trim(),
    phone: $("phone").value.trim(),
    email: $("email").value.trim(),
    whatsapp: $("whatsapp").value.trim(),
    mapEmbedUrl: $("mapEmbedUrl").value.trim(),
    facebook: $("facebook").value.trim(),
    instagram: $("instagram").value.trim(),
    youtube: $("youtube").value.trim(),
    tiktok: $("tiktok").value.trim(),
    whatsappLink: $("whatsappLink").value.trim(),
    liveStreamEmbedUrl: $("liveStreamEmbedUrl").value.trim(),
    liveStreamIsLive: $("liveStreamIsLive").checked,
    primaryColor: $("primaryColor")?.value.trim() || "",
    secondaryColor: $("secondaryColor")?.value.trim() || "",
    accentColor: $("accentColor")?.value.trim() || "",
    themeMode: $("themeMode")?.value || "light",
    pastor: {
      name: $("pastorName").value.trim(),
      title: $("pastorTitle").value.trim(),
      image: $("pastorImage").value.trim(),
      bio: $("pastorBio").value.trim(),
      quote: $("pastorQuote").value.trim()
    },
    about: {
      storyTitle: $("storyTitle").value.trim(),
      storyText1: $("storyText1").value.trim(),
      storyText2: $("storyText2").value.trim(),
      vision: $("vision").value.trim(),
      mission: $("mission").value.trim(),
      governance: $("governance").value.trim(),
      coreValues: values.map(v => ({ title: String(v.title || "").trim(), text: String(v.text || "").trim() }))
    },
    leadership: leaders.map(l => ({
      name: String(l.name || "").trim(),
      role: String(l.role || "").trim(),
      bio: String(l.bio || "").trim(),
      image: String(l.image || "").trim()
    })),
    updatedAt: new Date().toISOString()
  };

  try {
    // Save directly to Firestore. This avoids a Cloud Function/CORS dependency.
    // Firestore Security Rules still require the signed-in user to be admin/pastor.
    await setDoc(doc(db, "siteSettings", "general"), {
      ...d,
      updatedAt: serverTimestamp()
    }, { merge: true });

    msg("All website settings saved successfully. The public website will update automatically.");
  } catch (e) {
    console.error("Saving site settings failed:", e);
    msg("Could not save settings: " + (e?.message || "Permission denied"), true);
  }
});
