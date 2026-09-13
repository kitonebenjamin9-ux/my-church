/* EVENT REGISTRATION — Firebase/Firestore */
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const EVENTS = [
  { id: "sunday-worship", title: "Sunday Worship Service", date: "Aug 16, 2026", time: "8:00 AM & 10:30 AM", location: "Main Auditorium" },
  { id: "midweek-bible-study", title: "Midweek Bible Study", date: "Aug 19, 2026", time: "6:00 PM", location: "Fellowship Hall" },
  { id: "youth-revival", title: "Youth Revival Night", date: "Aug 22, 2026", time: "5:00 PM", location: "Fellowship Hall" },
  { id: "food-outreach", title: "Community Food Outreach", date: "Aug 29, 2026", time: "9:00 AM", location: "Church Car Park" },
  { id: "prayer-deliverance", title: "Prayer & Deliverance Night", date: "Sep 5, 2026", time: "6:30 PM", location: "Main Auditorium" }
];

const eventSelect = document.getElementById("regEvent");
const form = document.getElementById("registerForm");
const formAlert = document.getElementById("formAlert");
const nameInput = document.getElementById("regName");
const emailInput = document.getElementById("regEmail");
const registerCardWrap = document.getElementById("registerCardWrap");
const confirmationCard = document.getElementById("confirmationCard");
const confirmSummary = document.getElementById("confirmSummary");
const confirmCode = document.getElementById("confirmCode");
const confirmQr = document.getElementById("confirmQr");

let currentUser = null;

const preselect = new URLSearchParams(window.location.search).get("event");
EVENTS.forEach((ev) => {
  const option = document.createElement("option");
  option.value = ev.id;
  option.textContent = `${ev.title} — ${ev.date}, ${ev.time}`;
  if (ev.id === preselect) option.selected = true;
  eventSelect.appendChild(option);
});

/* Event registration requires a signed-in member so Firestore can securely
   associate the registration with request.auth.uid. */
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;

  if (!user) {
    showAlert(
      "Please log in before registering for an event. ",
      "error",
      true
    );
    return;
  }

  if (user.displayName) nameInput.value = user.displayName;
  if (user.email) emailInput.value = user.email;
  showAlert("", "");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    showAlert("Please log in first, then return to Event Registration.", "error", true);
    return;
  }

  const chosenEvent = EVENTS.find((ev) => ev.id === eventSelect.value);
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const guests = parseInt(document.getElementById("regGuests").value, 10) || 1;
  const notes = document.getElementById("regNotes").value.trim();

  if (!chosenEvent || !name || !email) {
    showAlert("Please fill in the required fields.", "error");
    return;
  }

  const code = generateConfirmationCode();

  try {
    await addDoc(collection(db, "eventRegistrations"), {
      eventId: chosenEvent.id,
      eventTitle: chosenEvent.title,
      eventDate: chosenEvent.date,
      eventTime: chosenEvent.time,
      location: chosenEvent.location,
      name,
      email,
      phone,
      guests,
      notes,
      uid: currentUser.uid,
      confirmationCode: code,
      status: "confirmed",
      createdAt: serverTimestamp()
    });

    showConfirmation(chosenEvent, code);

  } catch (error) {
    console.error("Event registration Firestore error:", error);
    const code = error?.code || "";
    if (code === "permission-denied") {
      showAlert(
        "Firebase denied this registration. Make sure the Firestore rules include eventRegistrations and that you are signed in.",
        "error"
      );
    } else {
      showAlert("Could not complete your registration: " + (error?.message || "Unknown error"), "error");
    }
  }
});

function showConfirmation(chosenEvent, code) {
  registerCardWrap.style.display = "none";
  confirmationCard.style.display = "block";
  confirmSummary.textContent = `${chosenEvent.title} — ${chosenEvent.date}, ${chosenEvent.time} at ${chosenEvent.location}`;
  confirmCode.textContent = code;
  confirmQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(code)}`;
}

function generateConfirmationCode() {
  return "HT-" + Math.random().toString(36).slice(2, 6).toUpperCase() + Date.now().toString().slice(-4);
}

function showAlert(text, type, withLoginLink = false) {
  if (!formAlert) return;
  formAlert.className = "form-alert " + (type || "");
  formAlert.innerHTML = text ? escapeHTML(text) : "";
  if (withLoginLink) {
    formAlert.innerHTML += ` <a href="login.html">Go to Member Login →</a>`;
  }
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}
