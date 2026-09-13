/* Firebase initialization for Healing Tabernacle Centre Nabw */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYPz0xFZX-rZeMqLnYPCNjgJZnbBmlVMc",
  authDomain: "healing-tabernacle-centre-nabw.firebaseapp.com",
  projectId: "healing-tabernacle-centre-nabw",
  storageBucket: "healing-tabernacle-centre-nabw.firebasestorage.app",
  messagingSenderId: "469662640530",
  appId: "1:469662640530:web:7d42708ee96ed1f93ef94b",
  measurementId: "G-TC56ZFLXQD"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});
