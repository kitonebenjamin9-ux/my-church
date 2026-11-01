/* =========================================================================
   giving.js — powers give.html and the giving-mtn / giving-airtel /
   giving-bank detail pages: "Copy" buttons for account/phone numbers.
   Loaded AFTER js/config.js and js/main.js on those pages only.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", function () {
  setupCopyButtons();
});

function setupCopyButtons() {
  const buttons = document.querySelectorAll(".copy-btn[data-copy]");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const value = btn.getAttribute("data-copy");
      copyToClipboard(value, btn);
    });
  });
}

function copyToClipboard(text, btn) {
  const done = function () {
    const original = btn.textContent;
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove("copied");
    }, 1800);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(function () {
      fallbackCopy(text, done);
    });
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const tmp = document.createElement("textarea");
  tmp.value = text;
  tmp.style.position = "fixed";
  tmp.style.opacity = "0";
  document.body.appendChild(tmp);
  tmp.select();
  try { document.execCommand("copy"); } catch (e) { /* no-op */ }
  document.body.removeChild(tmp);
  done();
}
