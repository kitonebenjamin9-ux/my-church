import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const info = document.getElementById("adminInfo");
const message = document.getElementById("adminMessage");
const logout = document.getElementById("logout");

function fail(text){ if(message){message.textContent=text;message.style.color="#dc3545";} }

onAuthStateChanged(auth, async (user) => {
  if(!user){ location.href="admin-login.html"; return; }
  try{
    const snap=await getDoc(doc(db,"users",user.uid));
    const role=String(snap.data()?.role||"").trim().toLowerCase();
    if(!snap.exists()){
      fail("Access denied: your Firebase Authentication account has no users/UID administrator profile. Create users/" + user.uid + " in Firestore and set role to admin or pastor.");
      return;
    }
    if(!["admin","pastor"].includes(role)){
      fail("Access denied: your users/" + user.uid + " profile has role " + JSON.stringify(snap.data()?.role || "(missing)") + ". Set role to admin or pastor.");
      return;
    }
    if(info) info.textContent=`Administrator: ${snap.data()?.name || user.displayName || user.email}`;
  }catch(error){
    console.error(error);
    fail("Could not verify administrator access.");
  }
});

logout?.addEventListener("click", async ()=>{ try{await signOut(auth);location.href="admin-login.html";}catch(e){console.error(e);} });
