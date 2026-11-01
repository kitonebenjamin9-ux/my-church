import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const form = document.getElementById("contact-form");
const alertBox = document.getElementById("form-alert");

function show(text, type = "error") {
  if (!alertBox) return;
  alertBox.textContent = text;
  alertBox.className = `form-alert ${type}`;
  alertBox.setAttribute("role", "alert");
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypot = form.querySelector("#hp-field")?.value?.trim();
    if (honeypot) return; // silently reject simple bots

    const name = form.querySelector("#name")?.value.trim();
    const email = form.querySelector("#email")?.value.trim();
    const phone = form.querySelector("#phone")?.value.trim() || "";
    const subject = form.querySelector("#subject")?.value.trim() || "General Inquiry";
    const message = form.querySelector("#message")?.value.trim();

    if (!name || !email || !message) {
      show("Please enter your name, email address and message.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      show("Please enter a valid email address.");
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.textContent = "Sending…";
    }
    show("Sending your message…", "info");

    try {
      // Write directly to Firestore. The public create rule only permits
      // messages whose status is "new"; administrators can read/manage them.
      const ref = await addDoc(collection(db, "contactMessages"), {
        name,
        email,
        phone,
        subject,
        message,
        status: "new",
        source: "website-contact-form",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      form.reset();
      show(`Thank you. Your message has been sent to the church administrator. Reference: ${ref.id}`, "success");
    } catch (error) {
      console.error("Contact form submission failed:", error);
      show(
        error?.message
          ? `We could not send your message: ${error.message}`
          : "We could not send your message right now. Please try again or contact the church directly."
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Send Message";
      }
    }
  });
}
