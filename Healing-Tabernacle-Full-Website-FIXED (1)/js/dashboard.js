/* =========================================================================
   DASHBOARD.js — MEMBER DASHBOARD
   =========================================================================
   Powers dashboard.html. Requires login (redirects to login.html if the
   visitor is not signed in). Pulls together:
     - the member's own profile (users/{uid})
     - their prayer request stats (prayerRequests where uid == uid)
     - their event registrations (eventRegistrations where uid == uid)
   Reuses the same Firebase auth/db instances as prayer.js / admin.js.
   ========================================================================= */

import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut, updateProfile, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const welcomeHeading = document.getElementById("welcomeHeading");
const userInfo = document.getElementById("userInfo");
const accountDetails = document.getElementById("accountDetails");
const adminLinkWrap = document.getElementById("adminLinkWrap");

const statPending = document.getElementById("statPending");
const statHandled = document.getElementById("statHandled");
const statTotal = document.getElementById("statTotal");

const myRegistrations = document.getElementById("myRegistrations");
const logoutButton = document.getElementById("logout");
const savedVerseCount = document.getElementById("savedVerseCount");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  let displayName = user.displayName || user.email;
  let role = "member";
  let joined = null;

  try {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      displayName = data.name || displayName;
      role = data.role || "member";
      joined = data.createdAt;
    }
  } catch (error) {
    console.error(error);
  }

  welcomeHeading.textContent = `Welcome, ${displayName}`;
  userInfo.textContent = `Signed in as ${user.email}`;
  accountDetails.innerHTML =
    `<strong>Name:</strong> ${escapeHTML(displayName)}<br>` +
    `<strong>Email:</strong> ${escapeHTML(user.email)}<br>` +
    `<strong>Role:</strong> ${escapeHTML(role)}` +
    (joined ? `<br><strong>Member since:</strong> ${formatDate(joined)}` : "");

  if (role === "admin" || role === "pastor") {
    adminLinkWrap.style.display = "block";
  }

  loadPrayerStats(user.uid);
  loadMyRegistrations(user.uid);
  if(savedVerseCount){ const saved=JSON.parse(localStorage.getItem("htm-saved-verses")||"[]"); savedVerseCount.textContent=`${saved.length} saved on this device`; }
});

/* ================================
   PRAYER REQUEST STATS
   ================================ */

function loadPrayerStats(uid) {
  const q = query(collection(db, "prayerRequests"), where("uid", "==", uid));

  onSnapshot(q, (snapshot) => {
    let pending = 0;
    let handled = 0;

    snapshot.forEach((docSnap) => {
      const status = (docSnap.data().status || "Pending");
      if (status === "Handled") handled++;
      else pending++;
    });

    statPending.textContent = pending;
    statHandled.textContent = handled;
    statTotal.textContent = pending + handled;
  }, (error) => {
    console.error(error);
  });
}

/* ================================
   MY EVENT REGISTRATIONS
   ================================ */

function loadMyRegistrations(uid) {
  const q = query(collection(db, "eventRegistrations"), where("uid", "==", uid));

  onSnapshot(q, (snapshot) => {

    if (snapshot.empty) {
      myRegistrations.innerHTML = "<p class=\"form-note\">You haven't registered for any events yet.</p>";
      return;
    }

    const items = [];
    snapshot.forEach((docSnap) => items.push(docSnap.data()));

    items.sort((a, b) => {
      const aTime = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    myRegistrations.innerHTML = "";

    items.forEach((item) => {
      const div = document.createElement("div");
      div.className = "dash-reg-item";
      div.innerHTML = `
        <h4>${escapeHTML(item.eventTitle || "Event")}</h4>
        <p style="margin:0;">${escapeHTML(item.eventDate || "")} ${item.eventTime ? "· " + escapeHTML(item.eventTime) : ""}</p>
        <small>Guests: ${escapeHTML(String(item.guests || 1))} · Confirmation: ${escapeHTML(item.confirmationCode || "—")}</small>
      `;
      myRegistrations.appendChild(div);
    });
  }, (error) => {
    console.error(error);
    myRegistrations.innerHTML = "<p class=\"form-note\">Unable to load your registrations.</p>";
  });
}

/* ================================
   LOGOUT
   ================================ */

logoutButton.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error(error);
  }
});

/* ================================
   HELPERS
   ================================ */

function formatDate(timestamp) {
  if (!timestamp) return "";
  try {
    return timestamp.toDate().toLocaleDateString();
  } catch {
    return "";
  }
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}
