import { auth, db } from "./firebase.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
collection,
addDoc,
query,
where,
onSnapshot,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const form =
document.getElementById("prayerForm");

const message =
document.getElementById("message");

const userInfo =
document.getElementById("userInfo");

const myRequests =
document.getElementById("myRequests");

let currentUser = null;

/* ================================
CHECK LOGIN
================================ */

onAuthStateChanged(
auth,
(user) => {

if (!user) {

  window.location.href =
    "login.html";

  return;

}


currentUser = user;


userInfo.textContent =
  `Logged in as ${
    user.displayName ||
    user.email
  }`;


loadMyRequests(
  user.uid
);

}
);

/* ================================
SEND PRAYER REQUEST
================================ */

let lastPrayerSubmit = Number(localStorage.getItem("htm_last_prayer_submit") || 0);
form.addEventListener(
"submit",
async (e) => {

e.preventDefault();
if (Date.now() - lastPrayerSubmit < 30000) { message.textContent = "Please wait a moment before submitting another request."; return; }
const textCheck = document.getElementById("request").value.trim();
if (textCheck.length < 5) { message.textContent = "Please enter a meaningful prayer request."; return; }


if (!currentUser) {

  return;

}


const request =
  document
    .getElementById("request")
    .value
    .trim();

const category =
  document.getElementById("category")
    ? document.getElementById("category").value
    : "Other";

const isPrivate =
  document.getElementById("isPrivate")
    ? document.getElementById("isPrivate").checked
    : false;

const wantsPrayerPartner =
  document.getElementById("wantsPrayerPartner")
    ? document.getElementById("wantsPrayerPartner").checked
    : false;


if (!request) {

  message.textContent =
    "Please write your prayer request.";

  return;

}


try {

  lastPrayerSubmit = Date.now(); localStorage.setItem("htm_last_prayer_submit", String(lastPrayerSubmit));

await addDoc(
    collection(
      db,
      "prayerRequests"
    ),
    {

      uid:
        currentUser.uid,

      name:
        currentUser.displayName ||
        currentUser.email,

      email:
        currentUser.email,

      request:
        request,

      category:
        category,

      isPrivate:
        isPrivate,

      wantsPrayerPartner:
        wantsPrayerPartner,

      status:
        "Pending",

      createdAt:
        serverTimestamp()

    }
  );


  message.textContent =
    "Your prayer request has been sent to the pastor." +
    (wantsPrayerPartner ? " A member of our prayer team will also reach out to pray with you." : "");


  form.reset();

} catch (error) {

  console.error(error);


  message.textContent =
    "Could not send your prayer request.";

}

}
);

/* ================================
LOAD MY PRAYER REQUESTS
================================ */

function loadMyRequests(uid) {

const q =
query(
collection(
db,
"prayerRequests"
),

  where(
    "uid",
    "==",
    uid
  )
);

onSnapshot(
q,
(snapshot) => {

  myRequests.innerHTML =
    "";


  if (snapshot.empty) {

    myRequests.innerHTML =
      "<p>You have not submitted any prayer requests yet.</p>";

    return;

  }


  snapshot.forEach(
    (requestDoc) => {

      const data =
        requestDoc.data();


      const div =
        document.createElement(
          "div"
        );


      div.style.cssText = `
        background:#ffffff;
        border-radius:14px;
        padding:22px;
        margin:18px 0;
        box-shadow:0 5px 20px rgba(0,0,0,.08);
        border-left:5px solid #0B2A6B;
      `;


      const status =
        data.status ||
        "Pending";


      let replyHTML =
        "";


      if (data.pastorReply) {

        replyHTML = `

          <div style="
            margin-top:20px;
            padding:18px;
            background:#EAF0FB;
            border-radius:10px;
            border-left:4px solid #D4AF37;
          ">

            <p style="
              margin:0 0 8px;
              color:#0B2A6B;
              font-weight:700;
            ">
              💬 Pastor's Response
            </p>

            <p style="
              margin:0;
              line-height:1.6;
            ">
              ${escapeHTML(
                data.pastorReply
              )}
            </p>

            ${
              data.repliedAt
              ?

              `<small style="
                display:block;
                margin-top:10px;
                color:#777;
              ">
                Replied:
                ${formatDate(
                  data.repliedAt
                )}
              </small>`

              :

              ""
            }

          </div>

        `;

      } else {

        replyHTML = `

          <p style="
            margin-top:18px;
            color:#777;
            font-style:italic;
          ">
            🙏 The pastor has not replied yet.
          </p>

        `;

      }


      div.innerHTML = `

        <p>
          <strong>
            Category:
          </strong>
          ${escapeHTML(data.category || "Other")}
          ${data.isPrivate ? " · <em>Private</em>" : ""}
          ${data.wantsPrayerPartner ? " · 🙏 Prayer partner requested" : ""}
        </p>

        <p>
          <strong>
            Prayer:
          </strong>
        </p>

        <p>
          ${escapeHTML(
            data.request
          )}
        </p>


        <p>
          <strong>
            Status:
          </strong>

          <span style="
            color:${
              status === "Handled"
              ? "#198754"
              : "#b8860b"
            };
            font-weight:700;
          ">
            ${escapeHTML(
              status
            )}
          </span>

        </p>


        ${replyHTML}

      `;


      myRequests.appendChild(
        div
      );

    }
  );

},

(error) => {

  console.error(error);

  myRequests.innerHTML =
    "<p>Unable to load your prayer requests.</p>";

}

);

}

/* ================================
FORMAT DATE
================================ */

function formatDate(timestamp) {

if (!timestamp) {

return "";

}

try {

return timestamp
  .toDate()
  .toLocaleString();

} catch {

return "";

}

}

/* ================================
ESCAPE HTML
================================ */

function escapeHTML(text) {

const div =
document.createElement(
"div"
);

div.textContent =
String(text);

return div.innerHTML;

}

/* ================================
LOGOUT
================================ */

document
.getElementById("logout")
.addEventListener(
"click",
async () => {

  await signOut(auth);

  window.location.href =
    "login.html";

}

);