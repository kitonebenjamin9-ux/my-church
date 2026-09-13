import { auth } from "./firebase.js";

const PROJECT_ID = "healing-tabernacle-centre-nabw";
const REGION = "us-central1";
const BASE = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`;

export async function callFunction(name, body = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You are not signed in.");
  const token = await user.getIdToken(true);
  const response = await fetch(`${BASE}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  let data = {};
  try { data = await response.json(); } catch {}
  if (!response.ok) throw new Error(data.error || `Function request failed (${response.status}).`);
  return data;
}

export const CONTACT_FUNCTION = `${BASE}/submitContactMessage`;
