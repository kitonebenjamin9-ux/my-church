import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const form = document.getElementById("registerForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    message.textContent = "Creating your account...";

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: name
    });

    const userRef = doc(db, "users", user.uid);

    await setDoc(userRef, {
      name: name,
      email: email,
      role: "member",
      createdAt: new Date()
    });

    message.textContent = "Account created successfully!";

    setTimeout(() => {
      window.location.href = "prayer.html";
    }, 1000);

  } catch (error) {
    console.error("Registration error:", error);
    message.textContent = "Error: " + error.message;
  }
});