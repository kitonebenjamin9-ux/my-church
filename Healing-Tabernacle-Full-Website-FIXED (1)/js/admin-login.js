import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const form = document.getElementById("adminLoginForm");
const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");
const button = document.getElementById("adminLoginButton");
const message = document.getElementById("adminLoginMessage");

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `admin-login-message ${type}`;
}

function setBusy(busy) {
  button.disabled = busy;
  button.textContent = busy
    ? "Checking administrator access..."
    : "Sign In as Admin";
}

function normalizedRole(profileData) {
  return String(profileData?.role ?? "").trim().toLowerCase();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const profile = await getDoc(doc(db, "users", user.uid));
    if (profile.exists() && ["admin","pastor"].includes(normalizedRole(profile.data()))) {
      window.location.replace("admin.html");
    }
  } catch (error) {
    console.error("Admin session check failed:", error);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Please enter your admin email and password.");
    return;
  }

  setBusy(true);
  showMessage("Signing in...", "success");

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    const profileRef = doc(db, "users", user.uid);
    const profile = await getDoc(profileRef);

    if (!profile.exists()) {
      await signOut(auth);
      throw new Error(
        `Firebase login succeeded, but no Firestore profile exists at users/${user.uid}.`
      );
    }

    const data = profile.data();
    const role = normalizedRole(data);

    if (!["admin","pastor"].includes(role)) {
      await signOut(auth);

      if (!role) {
        throw new Error(
          "Your Firestore user profile has no role value. Set users/" +
          user.uid +
          " → role to the string admin."
        );
      }

      throw new Error(
        `Access denied. Firestore currently has role "${data.role}" for this account, but it must be "admin" or "pastor".`
      );
    }

    showMessage("Admin verified. Opening dashboard...", "success");
    window.location.replace("admin.html");
  } catch (error) {
    console.error("Admin login failed:", error);

    let text = error.message || "Admin login failed.";

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/invalid-login-credentials"
    ) {
      text = "Incorrect email or password.";
    } else if (error.code === "auth/too-many-requests") {
      text = "Too many attempts. Please wait and try again.";
    } else if (
      error.code === "permission-denied" ||
      /permission|insufficient permissions/i.test(text)
    ) {
      text =
        "Firebase login worked, but Firestore denied access to your users profile. Check Firestore Rules.";
    }

    showMessage(text);
    setBusy(false);
  }
});
