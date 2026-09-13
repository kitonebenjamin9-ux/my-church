/* =========================================================================
   AUTH.js — MEMBER LOGIN / REGISTER (Firebase Authentication)
   =========================================================================
   Powers login.html and register.html. Loaded as an ES module:
     <script type="module" src="js/auth.js"></script>

   - login.html   -> expects a form with id="login-form" (fields: #email, #password)
   - register.html -> expects a form with id="register-form" (fields: #name, #email, #password)

   On success, both flows redirect to prayer.html. New accounts get a
   matching profile document at users/{uid} in Firestore with role:"member"
   — that "role" field is what admin.html checks to decide who is allowed
   into the admin dashboard.
   ========================================================================= */

import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

function showAlert(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = "form-alert " + type;
}

function setLoading(button, isLoading, defaultText) {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? "Please wait…" : defaultText;
}

/* ---- LOGIN FORM ------------------------------------------------------- */
const loginForm = document.getElementById("login-form");
if (loginForm) {
  const alertBox = document.getElementById("form-alert");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const submitBtn = loginForm.querySelector("button[type=submit]");

    setLoading(submitBtn, true, "Log In");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showAlert(alertBox, "Login successful — redirecting…", "success");
      window.location.href = "prayer.html";
    } catch (err) {
      showAlert(alertBox, friendlyError(err), "error");
      setLoading(submitBtn, false, "Log In");
    }
  });
}

/* ---- REGISTER FORM ------------------------------------------------------ */
const registerForm = document.getElementById("register-form");
if (registerForm) {
  const alertBox = document.getElementById("form-alert");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const submitBtn = registerForm.querySelector("button[type=submit]");

    setLoading(submitBtn, true, "Create Account");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        role: "member",
        createdAt: serverTimestamp()
      });
      showAlert(alertBox, "Account created — redirecting…", "success");
      window.location.href = "prayer.html";
    } catch (err) {
      showAlert(alertBox, friendlyError(err), "error");
      setLoading(submitBtn, false, "Create Account");
    }
  });
}

/* ---- SIGN OUT (used by prayer.html) ------------------------------------ */
const signOutBtn = document.getElementById("sign-out-btn");
if (signOutBtn) {
  signOutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

/* ---- Turn Firebase error codes into plain-English messages ------------- */
function friendlyError(err) {
  const code = err && err.code ? err.code : "";
  const map = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use": "An account with that email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/missing-password": "Please enter a password."
  };
  return map[code] || "Something went wrong. Please try again.";
}

export { onAuthStateChanged, auth };
