// Event registrations are now protected by the Secure Messages & Ministry Records gate.
const target = new URL("admin-secure.html?tab=eventRegistrations", window.location.href).href;
window.location.replace(target);
