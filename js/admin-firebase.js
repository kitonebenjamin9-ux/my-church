import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const requests = document.getElementById("requests");
const adminInfo = document.getElementById("adminInfo");

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadAdmin(user);

});


async function loadAdmin(user) {

  // The Firestore security rules are the real protection.
  // This check also prevents ordinary members from using this page.

  const profile = await getDoc(doc(db, "users", user.uid));

  if (!profile.exists()) {
    await signOut(auth);
    window.location.href = "login.html";
    return;
  }

  const data = profile.data();

  if (
    data.role !== "admin" &&
    data.role !== "pastor"
  ) {

    alert("You are not authorized to access this page.");

    await signOut(auth);

    window.location.href = "login.html";

    return;
  }

  adminInfo.textContent =
    `Logged in as ${data.role}: ${user.email}`;

  loadRequests();

}


function loadRequests() {

  onSnapshot(
    collection(db, "prayerRequests"),
    (snapshot) => {

      requests.innerHTML = "";

      if (snapshot.empty) {

        requests.innerHTML =
          "<p>No prayer requests yet.</p>";

        return;
      }

      snapshot.forEach((requestDoc) => {

        const data = requestDoc.data();

        const card = document.createElement("div");
        card.className = "request-card";

        card.innerHTML = `

          <h3>${escapeHTML(data.name || "Member")}</h3>

          <p>
            <strong>Email:</strong>
            ${escapeHTML(data.email || "")}
          </p>

          <p>
            <strong>Prayer Request:</strong>
          </p>

          <p>
            ${escapeHTML(data.request || "")}
          </p>

          <p>
            <strong>Status:</strong>
            ${escapeHTML(data.status || "Pending")}
          </p>

          <select class="status">

            <option value="Pending"
              ${data.status === "Pending" ? "selected" : ""}>
              Pending
            </option>

            <option value="Praying"
              ${data.status === "Praying" ? "selected" : ""}>
              Praying
            </option>

            <option value="Answered"
              ${data.status === "Answered" ? "selected" : ""}>
              Answered
            </option>

          </select>

          <button class="update">
            Update Status
          </button>

          <button class="delete">
            Delete
          </button>

        `;

        const select =
          card.querySelector(".status");

        card.querySelector(".update")
          .addEventListener("click", async () => {

            await updateDoc(
              doc(db, "prayerRequests", requestDoc.id),
              {
                status: select.value
              }
            );

            alert("Status updated.");

          });


        card.querySelector(".delete")
          .addEventListener("click", async () => {

            if (
              !confirm(
                "Delete this prayer request?"
              )
            ) return;

            await deleteDoc(
              doc(
                db,
                "prayerRequests",
                requestDoc.id
              )
            );

          });

        requests.appendChild(card);

      });

    }
  );

}


function escapeHTML(text) {

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;

}


document.getElementById("logout")
  .addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

  });
