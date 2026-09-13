/* HTM PLATFORM CORE — additive Firebase-powered dynamic layer */
import { db } from "./firebase.js";
import {
  collection, getDocs, getDoc, doc, query, where, orderBy, limit, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const esc = s => { const d=document.createElement("div"); d.textContent=String(s??""); return d.innerHTML; };
const wa = n => { const x=String(n||"").replace(/\D/g,""); return x ? `https://wa.me/${x}` : "#"; };
const coll = async (name, opts={}) => {
  try {
    let qref=collection(db,name);
    const constraints=[];
    if(opts.where) constraints.push(where(...opts.where));
    if(opts.orderBy) constraints.push(orderBy(...opts.orderBy));
    if(opts.limit) constraints.push(limit(opts.limit));
    const snap=await getDocs(constraints.length?query(qref,...constraints):qref);
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ console.warn(`[HTM] ${name}`,e); return []; }
};
const local = async (file) => {
  try { const r=await fetch(file); return r.ok?await r.json():[]; } catch { return []; }
};

async function getSetting(){
  try { const s=await getDoc(doc(db,"siteSettings","general")); return s.exists()?s.data():{}; } catch { return {}; }
}

function injectTheme(s){
  const root=document.documentElement;
  const mode=s.themeMode || "light";
  root.dataset.theme=mode;
  root.style.setProperty("--htm-primary",s.primaryColor||"#4b0082");
  root.style.setProperty("--htm-secondary",s.secondaryColor||"#d4af37");
  root.style.setProperty("--htm-accent",s.accentColor||"#173f8a");
  if(s.autoColors){
    root.classList.add("htm-auto-colors");
    if(!document.getElementById("htm-theme-keyframes")){
      const st=document.createElement("style"); st.id="htm-theme-keyframes";
      st.textContent=`@keyframes htmHue{0%,100%{--htm-primary:#173f8a;--htm-secondary:#d4af37}25%{--htm-primary:#4b0082;--htm-secondary:#d4af37}50%{--htm-primary:#5b1537;--htm-secondary:#e3b341}75%{--htm-primary:#263238;--htm-secondary:#c9a227}}.htm-auto-colors{animation:htmHue 80s ease-in-out infinite}`;
      document.head.appendChild(st);
    }
  }
}

function addGlobalStyles(){
 if(document.getElementById("htm-platform-css")) return;
 const st=document.createElement("style"); st.id="htm-platform-css";
 st.textContent=`:root{--htm-primary:#4b0082;--htm-secondary:#d4af37;--htm-accent:#173f8a}body{overflow-x:hidden}.htm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}.htm-card{background:var(--color-bg,#fff);border:1px solid var(--color-border,#e7e2ed);border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.07);transition:.35s}.htm-card:hover{transform:translateY(-4px)}.htm-card img,.htm-card video{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}.htm-card-body{padding:18px}.htm-pill{display:inline-block;padding:6px 10px;border-radius:999px;background:color-mix(in srgb,var(--htm-primary) 12%,transparent);color:var(--htm-primary);font-weight:700;font-size:.78rem}.htm-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}.htm-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;border-radius:10px;padding:10px 14px;background:var(--htm-primary);color:#fff;text-decoration:none;cursor:pointer;font-weight:700}.htm-btn.alt{background:var(--htm-secondary);color:#111}.htm-btn.ghost{background:transparent;color:var(--htm-primary);border:1px solid var(--htm-primary)}.htm-empty{padding:28px;border:1px dashed var(--color-border,#ddd);border-radius:14px;text-align:center}.htm-live{display:inline-flex;align-items:center;gap:7px;font-weight:800;color:#b00020}.htm-live i{width:9px;height:9px;background:#b00020;border-radius:50%;display:block;animation:htmpulse 1.4s infinite}@keyframes htmpulse{50%{opacity:.25}}#htm-ai{position:fixed;right:18px;bottom:18px;z-index:9999}#htm-ai-toggle{width:58px;height:58px;border-radius:50%;border:0;background:var(--htm-primary);color:#fff;font-size:24px;box-shadow:0 12px 30px rgba(0,0,0,.25);cursor:pointer}#htm-ai-panel{display:none;width:min(380px,calc(100vw - 28px));height:min(620px,calc(100vh - 105px));background:#fff;border-radius:18px;box-shadow:0 20px 55px rgba(0,0,0,.28);overflow:hidden;flex-direction:column;margin-bottom:10px}#htm-ai-panel.open{display:flex}.htm-ai-head{background:var(--htm-primary);color:#fff;padding:14px 16px;display:flex;justify-content:space-between;align-items:center}.htm-ai-msgs{flex:1;overflow:auto;padding:14px;background:#f7f7fa}.htm-ai-msg{max-width:88%;padding:10px 12px;border-radius:13px;margin:7px 0;white-space:pre-wrap;line-height:1.45}.htm-ai-msg.user{margin-left:auto;background:var(--htm-primary);color:#fff}.htm-ai-msg.bot{background:#fff;border:1px solid #e7e7ea}.htm-ai-form{display:flex;padding:10px;border-top:1px solid #eee;gap:8px}.htm-ai-form textarea{flex:1;resize:none;border:1px solid #ddd;border-radius:10px;padding:9px}.htm-ai-form button{border:0;border-radius:10px;background:var(--htm-primary);color:#fff;padding:0 14px}.htm-video-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:22px}.htm-video-card video{background:#000}.htm-section{padding:70px 0}.htm-section h2{margin-bottom:10px}.htm-search{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px}.htm-search input,.htm-search select,.htm-form input,.htm-form textarea,.htm-form select{padding:12px;border:1px solid #d8d8df;border-radius:10px;width:100%;box-sizing:border-box}.htm-search input{flex:1;min-width:220px}.htm-form{display:grid;gap:12px}.htm-form label{font-weight:700}.htm-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:700px){.htm-two{grid-template-columns:1fr}#htm-ai{right:10px;bottom:10px}}`;
 document.head.appendChild(st);
}

async function renderVerse(){
 const el=document.querySelector("[data-htm-verse]");
 if(!el) return;
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Kampala",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 let rows=await coll("dailyVerses",{where:["date","==",today]});
 let v=rows[0];
 if(!v){
   try{const r=await fetch("https://us-central1-healing-tabernacle-centre-nabw.cloudfunctions.net/dailyVerse");if(r.ok)v=await r.json();}catch(e){console.warn("Daily verse function unavailable",e)}
 }
 if(!v){rows=await coll("dailyVerses",{orderBy:["date","desc"],limit:1});v=rows[0];}
 if(!v){ el.innerHTML=`<div class="htm-empty">Verse of the Day is being prepared.</div>`; return; }
 el.innerHTML=`<div class="htm-card"><div class="htm-card-body"><span class="htm-pill">${esc(v.translation||"KJV")} · Daily Word</span><h3>${esc(v.reference||"")}</h3><p style="font-size:1.25rem;line-height:1.65">“${esc(v.text||"")}”</p>${v.devotion?`<p><strong>Today's reflection:</strong> ${esc(v.devotion)}</p>`:""}<div class="htm-actions"><button class="htm-btn ghost" data-copy-verse>Copy</button><a class="htm-btn" target="_blank" rel="noopener" href="${wa(v.shareWhatsApp||"")}">WhatsApp</a><a class="htm-btn alt" href="bible.html?ref=${encodeURIComponent(v.reference||"")}">Read in Bible</a></div></div></div>`;
 el.querySelector("[data-copy-verse]")?.addEventListener("click",async e=>{await navigator.clipboard?.writeText(`${v.text} — ${v.reference}`);e.target.textContent="Copied";});
 const prev=document.getElementById("previous-devotionals");
 if(prev){const history=await coll("dailyVerses",{orderBy:["date","desc"],limit:8});prev.innerHTML=history.filter(x=>x.date!==v.date).map(x=>`<div class="htm-card" style="margin:10px 0"><div class="htm-card-body"><strong>${esc(x.date||"")}</strong><h3>${esc(x.reference||"")}</h3><p>${esc(x.text||"")}</p></div></div>`).join("")||"<div class='htm-empty'>Previous devotionals will appear here.</div>";}
}
async function renderEvents(){
 const el=document.querySelector("[data-htm-events]"); if(!el)return;
 let rows=await coll("events",{orderBy:["date","asc"],limit:6});
 if(!rows.length) rows=await local("data/events.json");
 el.innerHTML=rows.length?rows.map(x=>`<article class="htm-card"><div class="htm-card-body"><span class="htm-pill">${esc(x.category||"Church Event")}</span><h3>${esc(x.title||x.name)}</h3><p>${esc(x.date||"")} ${esc(x.time||"")}</p><p>${esc(x.location||x.description||"")}</p><a class="htm-btn" href="event-register.html?event=${encodeURIComponent(x.id||x.title||"")}">Register</a></div></article>`).join(""):`<div class="htm-empty">No upcoming events yet.</div>`;
}

async function renderSermons(){
 const el=document.querySelector("[data-htm-sermons]"); if(!el)return;
 let rows=await coll("sermons",{orderBy:["date","desc"],limit:9}); if(!rows.length) rows=await local("data/sermons.json");
 el.innerHTML=rows.length?rows.map(x=>`<article class="htm-card"><div class="htm-card-body"><span class="htm-pill">${esc(x.category||"Message")}</span><h3>${esc(x.title||"Sermon")}</h3><p>${esc(x.speaker||"")} · ${esc(x.date||"")}</p>${x.liveStreamUrl?`<span class="htm-live"><i></i> WATCH LIVE</span>`:""}<div class="htm-actions">${x.videoUrl||x.youtubeUrl?`<a class="htm-btn" target="_blank" rel="noopener" href="${esc(x.videoUrl||x.youtubeUrl)}">Watch</a>`:""}${x.audioUrl?`<a class="htm-btn ghost" target="_blank" rel="noopener" href="${esc(x.audioUrl)}">Audio</a>`:""}</div></div></article>`).join(""):`<div class="htm-empty">No sermons published yet.</div>`;
}

async function renderBranches(){
 const el=document.querySelector("[data-htm-branches]"); if(!el)return;
 let rows=await coll("branches",{orderBy:["name","asc"]});
 if(!rows.length) rows=[
  {name:"Main Branch",location:"Uganda",description:"Healing Tabernacle Ministries"},
  {name:"Branch 2",location:"Uganda",description:"A local Healing Tabernacle family"},
  {name:"Branch 3",location:"Uganda",description:"A local Healing Tabernacle family"}
 ];
 el.innerHTML=rows.map(x=>`<article class="htm-card">${x.photoUrl?`<img src="${esc(x.photoUrl)}" alt="${esc(x.name)}">`:""}<div class="htm-card-body"><h3>${esc(x.name)}</h3><p>${esc(x.location||x.address||"")}</p><p>${esc(x.serviceTimes||"")}</p><p>${esc(x.description||"")}</p><div class="htm-actions">${x.whatsapp?`<a class="htm-btn" target="_blank" rel="noopener" href="${wa(x.whatsapp)}">WhatsApp</a>`:""}${x.id?`<a class="htm-btn ghost" href="branch.html?id=${encodeURIComponent(x.id)}">View Branch</a>`:""}</div></div></article>`).join("");
}


async function renderLeadership(){
 const el=document.getElementById("leadership-list"); if(!el)return;
 let rows=await coll("ministryLeaders",{orderBy:["name","asc"],limit:30});
 if(!rows.length) rows=(CONFIG.leadership||[]).map((x,i)=>({...x,id:"local-"+i}));
 if(!rows.length){el.innerHTML=`<div class="htm-empty">Leadership information will appear here when published by an administrator.</div>`;return;}
 el.innerHTML=rows.map(x=>{
   const image=x.image||x.imageUrl||"assets/images/placeholder.jpg";
   const name=x.name||"Church Leader"; const role=x.role||x.title||"";
   return `<article class="leader"><div class="leader-photo"><img loading="lazy" src="${esc(image)}" alt="${esc(name)}" onerror="this.src='assets/images/placeholder.jpg'"><div class="leader-body"><h3>${esc(name)}</h3><span>${esc(role)}</span><p>${esc(x.bio||x.description||"")}</p></div></div></article>`;
 }).join("");
}

async function renderMinistries(){
 const el=document.querySelector("[data-htm-ministries]"); if(!el)return;
 let rows=await coll("ministries",{orderBy:["name","asc"]}); if(!rows.length) rows=await local("data/ministries.json");
 el.innerHTML=rows.map(x=>`<article class="htm-card">${x.imageUrl?`<img src="${esc(x.imageUrl)}" alt="${esc(x.name)}">`:""}<div class="htm-card-body"><h3>${esc(x.name)}</h3><p>${esc(x.description||"")}</p><p><strong>Leader:</strong> ${esc(x.leaderName||"")}</p><div class="htm-actions">${x.whatsapp?`<a class="htm-btn" target="_blank" rel="noopener" href="${wa(x.whatsapp)}">WhatsApp Leader</a>`:""}</div></div></article>`).join("")||`<div class="htm-empty">Ministries will appear here.</div>`;
}

async function renderTestimonies(){
 const el=document.querySelector("[data-htm-testimonies]"); if(!el)return;
 const rows=await coll("videoTestimonies",{where:["status","==","approved"],orderBy:["date","desc"],limit:12]);
 el.innerHTML=rows.length?rows.map(x=>`<article class="htm-card htm-video-card">${x.videoUrl?`<video controls preload="metadata" src="${esc(x.videoUrl)}"></video>`:""}<div class="htm-card-body"><h3>${esc(x.name||"Church Family")}</h3><p>${esc(x.branch||"Healing Tabernacle")} · ${esc(x.date||"")}</p></div></article>`).join(""):`<div class="htm-empty">Approved video testimonies will appear here.</div>`;
}

async function renderGallery(){
 const el=document.querySelector("[data-htm-gallery]"); if(!el)return;
 const rows=await coll("gallery",{orderBy:["createdAt","desc"],limit:12});
 if(!rows.length){el.innerHTML=`<div class="htm-empty">Gallery photos will appear here as the media team publishes them.</div>`;return;}
 el.innerHTML=rows.map(x=>`<img loading="lazy" src="${esc(x.url||"")}" alt="${esc(x.title||"Church gallery")}" style="width:100%;border-radius:14px;aspect-ratio:1;object-fit:cover">`).join("");
}

function mountAI(){
 if(document.getElementById("htm-ai"))return;
 const wrap=document.createElement("div");wrap.id="htm-ai";
 wrap.innerHTML=`<div id="htm-ai-panel"><div class="htm-ai-head"><strong>HTM AI Assistant</strong><button id="htm-ai-close" aria-label="Close">×</button></div><div class="htm-ai-msgs" id="htm-ai-msgs"><div class="htm-ai-msg bot">Hello! I can help with Bible questions, Christian topics, and Healing Tabernacle information. I will distinguish Scripture from interpretation and say when I am uncertain.</div></div><form class="htm-ai-form" id="htm-ai-form"><textarea id="htm-ai-input" rows="2" placeholder="Ask about the Bible or our church..." required></textarea><button>Send</button></form></div><button id="htm-ai-toggle" aria-label="Open HTM AI Assistant">✦</button>`;
 document.body.appendChild(wrap);
 const panel=wrap.querySelector("#htm-ai-panel"), msgs=wrap.querySelector("#htm-ai-msgs");
 wrap.querySelector("#htm-ai-toggle").onclick=()=>panel.classList.toggle("open");
 wrap.querySelector("#htm-ai-close").onclick=()=>panel.classList.remove("open");
 wrap.querySelector("#htm-ai-form").onsubmit=async e=>{
   e.preventDefault(); const input=wrap.querySelector("#htm-ai-input"), q=input.value.trim(); if(!q)return;
   const u=document.createElement("div");u.className="htm-ai-msg user";u.textContent=q;msgs.appendChild(u);input.value="";msgs.scrollTop=msgs.scrollHeight;
   const b=document.createElement("div");b.className="htm-ai-msg bot";b.textContent="Thinking…";msgs.appendChild(b);
   try{
     const r=await fetch("https://us-central1-healing-tabernacle-centre-nabw.cloudfunctions.net/htmAiAssistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q})});
     const data=await r.json(); b.textContent=data.answer||"I could not answer that right now.";
   }catch(err){b.textContent="The AI service is not connected yet. Please use the Bible reader or contact church leadership for help.";console.warn(err);}
   msgs.scrollTop=msgs.scrollHeight;
 };
}


async function renderHeroVideo(){
 const page=(location.pathname.split("/").pop()||"index.html").replace(".html","");
 const hero=await coll("heroVideos",{where:["active","==",true],limit:20});
 const item=hero.find(x=>x.page===page)||hero.find(x=>x.page==="all");
 if(!item)return;
 const target=document.querySelector(".page-hero")||document.querySelector(".hero");
 if(!target)return;
 if(target.querySelector("video.htm-hero-video"))return;
 target.style.position="relative";target.style.overflow="hidden";
 const v=document.createElement("video");v.className="htm-hero-video";v.autoplay=true;v.loop=true;v.muted=true;v.playsInline=true;v.preload="metadata";v.src=item.videoUrl||"";
 v.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0";
 if(item.fallbackImage)v.poster=item.fallbackImage;
 const overlay=document.createElement("div");overlay.style.cssText="position:absolute;inset:0;background:rgba(0,0,0,.48);z-index:1";
 Array.from(target.children).forEach(c=>{if(c!==v&&c!==overlay)c.style.position="relative",c.style.zIndex="2"});
 target.prepend(v);target.insertBefore(overlay,v.nextSibling);
}
async function renderProject(){
 const el=document.querySelector("[data-htm-project]");if(!el)return;
 let rows=await coll("churchProject",{limit:1});const x=rows[0];if(!x){el.innerHTML="";return}
 el.innerHTML=`<div class="htm-card">${x.mainImage?`<img src="${esc(x.mainImage)}" alt="${esc(x.title||"Proposed Church Project")}">`:""}<div class="htm-card-body"><span class="htm-pill">Proposed Church Project</span><h3>${esc(x.title||"Building the Vision")}</h3><p>${esc(x.description||"")}</p><p><strong>Vision:</strong> ${esc(x.vision||"")}</p><p><strong>Progress:</strong> ${esc(x.progress||"")}</p>${x.videoUrl?`<video controls src="${esc(x.videoUrl)}"></video>`:""}<div class="htm-actions">${x.supportUrl?`<a class="htm-btn" href="${esc(x.supportUrl)}">Support / Give</a>`:""}${x.videoUrl?`<a class="htm-btn ghost" href="${esc(x.videoUrl)}">Project Video</a>`:""}</div></div></div>`;
}
async function renderRotatingGallery(){
 const els=document.querySelectorAll("[data-htm-rotating-gallery]");if(!els.length)return;
 const rows=await coll("gallery",{orderBy:["createdAt","desc"],limit:40}); if(!rows.length)return;
 els.forEach(el=>{let i=0;const img=document.createElement("img");img.alt="Healing Tabernacle gallery";img.style.cssText="width:100%;height:320px;object-fit:cover;border-radius:18px;display:block;transition:opacity .9s ease";el.innerHTML="";el.appendChild(img);const show=()=>{img.style.opacity="0";setTimeout(()=>{img.src=rows[i++%rows.length].url||"";img.style.opacity="1"},500)};show();setInterval(show,6000)});
}


function startCollectionLiveSync(){
 const jobs=[
   ["events",()=>renderEvents()], ["sermons",()=>renderSermons()], ["branches",()=>renderBranches()],
   ["ministries",()=>renderMinistries()], ["ministryLeaders",()=>renderLeadership()],
   ["videoTestimonies",()=>renderTestimonies()], ["gallery",()=>renderGallery()], ["churchProject",()=>renderProject()]
 ];
 jobs.forEach(([name,fn])=>{
   try{ onSnapshot(collection(db,name), ()=>fn(), err=>console.warn(`[HTM] live ${name}`,err)); }catch(e){}
 });
}

async function init(){
 addGlobalStyles();
 const settings=await getSetting(); injectTheme(settings); mountAI();
 await Promise.allSettled([renderVerse(),renderEvents(),renderSermons(),renderBranches(),renderMinistries(),renderLeadership(),renderTestimonies(),renderGallery(),renderHeroVideo(),renderProject(),renderRotatingGallery()]);
}
init();
