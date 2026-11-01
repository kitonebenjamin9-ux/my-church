const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const AI_API_KEY = defineSecret("AI_API_KEY");
const AI_BASE_URL = defineSecret("AI_BASE_URL");
const AI_MODEL = defineSecret("AI_MODEL");

const DAILY_PASSAGES = [
  ["John 3:16","For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."],
  ["Psalm 23:1","The LORD is my shepherd; I shall not want."],
  ["Proverbs 3:5-6","Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths."],
  ["Isaiah 41:10","Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness."],
  ["Philippians 4:13","I can do all things through Christ which strengtheneth me."],
  ["Romans 8:28","And we know that all things work together for good to them that love God, to them who are the called according to his purpose."],
  ["Jeremiah 29:11","For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end."],
  ["Psalm 46:1","God is our refuge and strength, a very present help in trouble."],
  ["Matthew 11:28","Come unto me, all ye that labour and are heavy laden, and I will give you rest."],
  ["Joshua 1:9","Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest."],
  ["Psalm 119:105","Thy word is a lamp unto my feet, and a light unto my path."],
  ["2 Corinthians 5:17","Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new."],
  ["Galatians 5:22-23","But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law."],
  ["Psalm 121:1-2","I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth."],
  ["Hebrews 11:1","Now faith is the substance of things hoped for, the evidence of things not seen."],
  ["1 Peter 5:7","Casting all your care upon him; for he careth for you."],
  ["Psalm 34:8","O taste and see that the LORD is good: blessed is the man that trusteth in him."],
  ["Romans 12:2","And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God."],
  ["Matthew 6:33","But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you."],
  ["Ephesians 2:10","For we are his workmanship, created in Christ Jesus unto good works, which God hath before ordained that we should walk in them."],
  ["Psalm 37:4","Delight thyself also in the LORD; and he shall give thee the desires of thine heart."],
  ["Colossians 3:23","And whatsoever ye do, do it heartily, as to the Lord, and not unto men;"],
  ["1 Thessalonians 5:16-18","Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you."],
  ["Psalm 27:1","The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?"],
  ["2 Timothy 1:7","For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind."],
  ["James 1:5","If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him."],
  ["Psalm 91:1-2","He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust."],
  ["John 14:27","Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid."],
  ["Micah 6:8","He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?"],
  ["Psalm 19:14","Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer."]
];

function cors(req,res){res.set("Access-Control-Allow-Origin","*");res.set("Access-Control-Allow-Headers","Content-Type,Authorization");res.set("Access-Control-Allow-Methods","GET,POST,OPTIONS");}
function dateKey(d=new Date()){return new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Kampala",year:"numeric",month:"2-digit",day:"2-digit"}).format(d);}
function passageFor(date){let n=0;for(const c of date)n=(n*31+c.charCodeAt(0))%DAILY_PASSAGES.length;return DAILY_PASSAGES[n];}
async function fetchKJV(reference){
  try{
    const r=await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=kjv`);
    if(!r.ok) throw new Error(`Bible API ${r.status}`);
    const data=await r.json();
    const text=String(data.text||"").replace(/\s+/g," ").trim();
    if(text)return text;
  }catch(e){console.warn("Bible API unavailable; using KJV fallback",e.message)}
  return null;
}
async function syncDailyVerse(date=dateKey()){
  const [reference,fallback]=passageFor(date);
  const text=await fetchKJV(reference) || fallback;
  const devotion=`Read ${reference} slowly and pray over it today. Let God's Word shape your faith, choices and conversations. Return to the passage later and write down one truth you want to live out.`;
  await db.collection("dailyVerses").doc(date).set({date,reference,text,translation:"KJV",devotion,source:"Bible passage",updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
  return {date,reference,text,translation:"KJV",devotion};
}



async function verifyAdminRequest(req) {
  const header = String(req.headers.authorization || "");
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHENTICATED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("UNAUTHENTICATED");
  const decoded = await admin.auth().verifyIdToken(token);
  const profile = await db.collection("users").doc(decoded.uid).get();
  const role = String(profile.data()?.role || "").trim().toLowerCase();
  if (!profile.exists || !["admin", "pastor"].includes(role)) throw new Error("UNAUTHORIZED");
  return { uid: decoded.uid, role, profile: profile.data() || {} };
}

function cleanText(value, max = 10000) {
  return String(value ?? "").trim().slice(0, max);
}

exports.saveSiteSettings = onRequest({memory:"256MiB"}, async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
  try {
    await verifyAdminRequest(req);
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const docId = body.docId === "branches" ? "branches" : "general";
    const data = body.data && typeof body.data === "object" ? body.data : null;
    if (!data) return res.status(400).json({ error: "Settings data is required" });
    data.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await db.collection("siteSettings").doc(docId).set(data, { merge: true });
    return res.json({ ok: true, docId });
  } catch (e) {
    console.error("saveSiteSettings failed", e);
    if (e.message === "UNAUTHENTICATED") return res.status(401).json({ error: "Please sign in again." });
    if (e.message === "UNAUTHORIZED") return res.status(403).json({ error: "Administrator or pastor access is required." });
    return res.status(500).json({ error: "Could not save website settings." });
  }
});

exports.submitContactMessage = onRequest({memory:"256MiB"}, async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 200).toLowerCase();
    const phone = cleanText(body.phone, 60);
    const subject = cleanText(body.subject || "General Inquiry", 160);
    const message = cleanText(body.message, 5000);
    if (!name || !email || !message) return res.status(400).json({ error: "Name, email and message are required." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });
    const ref = await db.collection("contactMessages").add({
      name, email, phone, subject, message,
      status: "new",
      source: "website-contact-form",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return res.json({ ok: true, id: ref.id });
  } catch (e) {
    console.error("submitContactMessage failed", e);
    return res.status(500).json({ error: "We could not send your message right now." });
  }
});

exports.syncDailyVerse = onSchedule({schedule:"15 5 * * *",timeZone:"Africa/Kampala",memory:"256MiB"}, async()=>{await syncDailyVerse();});
exports.dailyVerse = onRequest({memory:"256MiB"}, async(req,res)=>{cors(req,res);if(req.method==="OPTIONS")return res.status(204).send("");try{const today=dateKey();const snap=await db.collection("dailyVerses").doc(today).get();const data=snap.exists?snap.data():await syncDailyVerse(today);return res.json(data)}catch(e){console.error(e);return res.status(500).json({error:"Daily verse unavailable"})}});

async function churchContext(){const names=["siteSettings","branches","ministries","ministryLeaders","events","sermons","announcements","dailyVerses","gallery","heroVideos","churchProject","mediaLibrary"];const out={};for(const n of names){try{const snap=await db.collection(n).limit(40).get();out[n]=snap.docs.map(d=>({id:d.id,...d.data()}));}catch(e){out[n]=[];}}return out;}
exports.htmAiAssistant = onRequest({secrets:[AI_API_KEY,AI_BASE_URL,AI_MODEL],timeoutSeconds:60,memory:"512MiB"},async(req,res)=>{cors(req,res);if(req.method==="OPTIONS")return res.status(204).send("");if(req.method!=="POST")return res.status(405).json({error:"POST required"});const message=String(req.body?.message||"").trim();if(!message)return res.status(400).json({error:"Message required"});const context=await churchContext();const system=`You are HTM AI Assistant for Healing Tabernacle Ministries. You are a Christian educational assistant, not God, Jesus, the Holy Spirit, a prophet, or a pastor. Never claim divine authority. Answer Bible and Christianity questions carefully. Distinguish Scripture, historical information, Christian interpretation, denominational belief, and uncertainty. Do not invent Bible quotations or church facts. For exact Scripture, provide references and encourage reading the passage in the Bible reader. Respect differences among Christian traditions. For medical, legal, crisis, or highly personal matters, encourage an appropriate qualified professional and trusted church leader. Current church data: ${JSON.stringify(context)}`;try{const key=AI_API_KEY.value(),base=AI_BASE_URL.value()||"https://api.openai.com",model=AI_MODEL.value()||"gpt-5-mini";if(!key)return res.status(503).json({answer:"The HTM AI service has not been configured by the administrator yet. Please use the Bible reader or contact the church."});const r=await fetch(`${base.replace(/\/$/,"")}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:"system",content:system},{role:"user",content:message}],temperature:.25,max_tokens:900})});const data=await r.json();if(!r.ok)throw new Error(JSON.stringify(data));return res.json({answer:data.choices?.[0]?.message?.content||"I could not answer that."});}catch(e){console.error(e);return res.status(500).json({error:"AI service unavailable"});}});
function notify(collectionName,label){return onDocumentCreated(`${collectionName}/{id}`,async(event)=>{const d=event.data?.data();if(!d)return;await db.collection("notifications").add({type:collectionName,label,message:`New ${label} submitted${d.name?` by ${d.name}`:""}`,recordId:event.params.id,status:"unread",createdAt:admin.firestore.FieldValue.serverTimestamp()});});}
exports.notifyPrayer=notify("prayerRequests","prayer request");exports.notifyTestimony=notify("videoTestimonies","video testimony");exports.notifyContact=notify("contactMessages","contact message");exports.notifyRegistration=notify("registrations","registration");exports.notifyEventRegistration=notify("eventRegistrations","event registration");
