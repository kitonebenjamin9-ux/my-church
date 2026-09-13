/* =========================================================================
   testimonies.js — powers the accordion "Read More" on testimonies.html.
   Loaded AFTER js/config.js and js/main.js, testimonies.html only.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".accordion-item");
  items.forEach(function (item) {
    const trigger = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", function () {
      const isOpen = item.classList.contains("open");

      // close any other open testimony first (accordion behaviour)
      items.forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          const otherPanel = other.querySelector(".accordion-panel");
          if (otherPanel) otherPanel.style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove("open");
        panel.style.maxHeight = null;
      } else {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
});
