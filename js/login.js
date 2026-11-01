import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  try {

    message.textContent = "Logging in...";

    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = credential.user;

    const userDoc =
      await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      message.textContent =
        "Your account profile was not found.";
      return;
    }

    const userData = userDoc.data();

    if (
      userData.role === "admin" ||
      userData.role === "pastor"
    ) {

      window.location.href = "admin.html";

    } else {

      window.location.href = "dashboard.html";

    }

  } catch (error) {

    console.error(error);

    message.textContent =
      "Login failed: " + error.message;

  }

});