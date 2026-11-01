/* Firebase-connected branch layer for mbale. */
import {db} from "../../js/firebase.js";
import {doc,getDoc,onSnapshot} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
const menu=document.getElementById("menu"),hamb=document.getElementById("hamb");
if(hamb)hamb.addEventListener("click",()=>menu?.classList.toggle("mobile"));
document.querySelectorAll(".drop>button").forEach(x=>x.addEventListener("click",()=>{if(innerWidth<=1120)x.parentElement.classList.toggle("open")}));
const slug="mbale";
const esc=s=>{const d=document.createElement("div");d.textContent=String(s??"");return d.innerHTML};
async function connectBranch(){
  try{
    const ref=doc(db,"siteSettings","branches");
    onSnapshot(ref,snap=>{
      const list=snap.exists()?(snap.data().list||[]):[];
      const b=list.find(x=>x.slug===slug); if(!b)return;
      window.HTM_BRANCH=b;
      document.title=(b.name||"Healing Tabernacle Branch")+" | Healing Tabernacle Ministries";
      document.querySelectorAll(".brand small").forEach(x=>x.textContent=(b.name||"").replace(/^Healing Tabernacle Ministries\s*[–-]\s*/i,"")||"Branch");
      const pastor=b.leader||{};
      document.querySelectorAll('img[alt*="pastor" i]').forEach(img=>{if(pastor.photoUrl)img.src=pastor.photoUrl;});
      document.querySelectorAll("footer p").forEach(p=>{const t=p.textContent||"";if(t.includes("☎")&&b.phone)p.textContent="☎ "+b.phone;if(t.includes("✉")&&b.email)p.textContent="✉ "+b.email;});
      document.querySelectorAll(".footer-map iframe").forEach(frame=>{const q=b.mapQuery||b.address||b.cityRegion||"Uganda";frame.src="https://www.google.com/maps?q="+encodeURIComponent(q)+"&output=embed";});
      document.querySelectorAll(".footer-col").forEach(col=>{if((col.textContent||"").includes("Find the ")){const h=col.querySelector("h3");if(h)h.textContent="Find the "+(b.name||"Branch").replace(/^Healing Tabernacle Ministries\s*[–-]\s*/i,"");}});
    });
  }catch(e){console.warn("Branch Firebase connection unavailable",e)}
}
connectBranch();
