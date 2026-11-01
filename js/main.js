/* =========================================================================
   main.js — HEALING TABERNACLE PUBLIC SITE
   Reads js/config.js (must be loaded BEFORE this file) and:
     1. Builds the header/nav and footer on every page
     2. Handles the mobile menu toggle
     3. Handles the gallery lightbox
     4. Handles the contact form (front-end only demo)
     5. Handles small UX touches: back-to-top button, scroll reveals, year
   ========================================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Render the site immediately from local CONFIG so visitors do not wait for Firebase.
  renderSiteImmediately();
  // Refresh with Firebase settings in the background when available.
  import("./site-settings.js").then(function(remote){
    return remote.loadRemoteSiteSettings();
  }).then(function(){
    refreshConfigDrivenContent();
    import("./live-sync.js").then(m=>m.startLiveSiteSync()).catch(()=>{});
  }).catch(function(e){
    console.warn("Remote settings unavailable; using local configuration.", e);
    import("./live-sync.js").then(m=>m.startLiveSiteSync()).catch(()=>{});
  });
});

function renderSiteImmediately(){
  buildHeader(); buildFooter(); setupSiteNavigation(); highlightActiveNavLink();
  setupBackToTop(); setupScrollReveal(); setupGalleryLightbox(); setupContactForm();
  populateConfigDrivenElements(); setupLivestreamStatus(); setupWhatsAppButton();
  populateDailyWord(); populateAnnouncements();
  if (!window.__HT_ENHANCEMENTS_READY) { window.__HT_ENHANCEMENTS_READY=true; const sc=document.createElement("script"); sc.src="js/site-enhancements.js"; document.head.appendChild(sc); }
}

function refreshConfigDrivenContent(){
  const header=document.getElementById("site-header");
  if(header){ header.innerHTML=""; buildHeader(); setupSiteNavigation(); highlightActiveNavLink(); }
  const footer=document.getElementById("site-footer");
  if(footer){ footer.innerHTML=""; buildFooter(); }
  populateConfigDrivenElements(); setupLivestreamStatus(); populateDailyWord(); populateAnnouncements();
}

/* ---------------------------------------------------------------------
   1. HEADER — injected into <div id="site-header"></div>
   Builds: desktop nav with dropdowns, an always-visible admin-bar link
   in the top-right corner, the hamburger button, and a mobile slide-out
   panel (appended to <body> so it can overlay the whole page). Driven
   entirely by CONFIG.navMenu / CONFIG.navCta / CONFIG.adminBar.
   --------------------------------------------------------------------- */
function buildHeader() {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  const menu = CONFIG.navMenu || [];
  const desktopItems = menu.map(buildDesktopNavItem).join("");
  const mobileItems = menu.map(function(item, i){
    if(!item.children || !item.children.length){
      return '<a class="mnp-link" href="'+item.href+'" data-href="'+item.href+'">'+item.label+'</a>';
    }
    const subs=item.children.map(function(c){return '<a href="'+c.href+'" data-href="'+c.href+'">'+c.label+'</a>';}).join("");
    return '<div class="mnp-item"><div class="mnp-parent-row"><a class="mnp-parent-link" href="'+item.href+'" data-href="'+item.href+'">'+item.label+'</a><button class="mnp-toggle" type="button" aria-label="Open '+item.label+' submenu" aria-expanded="false" data-target="mnp-sub-'+i+'"><span class="mnp-icon">+</span></button></div><div class="mnp-submenu" id="mnp-sub-'+i+'">'+subs+'</div></div>';
  }).join("");

  const social = CONFIG.social || {};
  const waHeaderLink = social.whatsapp || (CONFIG.contact && CONFIG.contact.whatsapp ? "https://wa.me/" + CONFIG.contact.whatsapp : "contact.html");
  const logo = CONFIG.logo;
  const adminHref = (CONFIG.adminBar && CONFIG.adminBar.href) || "admin-login.html";

  mount.innerHTML =
    '<header class="site-header" id="siteHeader">' +
    '  <div class="container nav-wrap">' +
    '    <a href="index.html" class="brand">' +
    '      <img src="' + logo + '" alt="' + CONFIG.siteName + ' logo" onerror="this.style.display=\'none\'">' +
    '      <span class="brand-text"><strong>HEALING TABERNACLE</strong><span>MINISTRIES</span></span>' +
    '    </a>' +
    '    <nav class="nav-links" id="nav-links">' + desktopItems + '</nav>' +
    '    <div class="header-right">' +
    '      <a class="header-icon-link search-header-icon" href="search.html" title="Search website" aria-label="Search website"><span class="header-icon">⌕</span><span class="header-icon-label">Search</span></a>' +
    '      <a class="header-icon-link admin-header-icon" href="' + adminHref + '" title="Admin Dashboard" aria-label="Admin Dashboard"><span class="header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l7 4v5c0 5-3.5 9-7 11-3.5-2-7-6-7-11V6l7-4Z"/><path d="M9.5 12l1.7 1.7L15 10"/></svg></span><span class="header-icon-label">Admin Dashboard</span></a>' +
    '      <a class="header-icon-link live-header-icon" href="livestream.html" title="Watch Live" aria-label="Watch Live"><span class="header-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5Z"/></svg></span><span class="header-icon-label">Watch Live</span></a>' +
    '      <a class="header-icon-link whatsapp-header-icon" href="' + waHeaderLink + '" title="Chat on WhatsApp" aria-label="Chat on WhatsApp" target="_blank" rel="noopener"><span class="header-icon"><img src="assets/icons/whatsapp-user.png" alt=""></span></a>' +
    '      <button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
    '    </div>' +
    '  </div>' +
    '</header>';

  const oldPanel=document.getElementById("mobile-nav-panel");
  const oldOverlay=document.getElementById("mobile-nav-overlay");
  if(oldPanel) oldPanel.remove();
  if(oldOverlay) oldOverlay.remove();

  const overlay=document.createElement("div");
  overlay.className="mobile-nav-overlay";
  overlay.id="mobile-nav-overlay";
  document.body.appendChild(overlay);

  const panel=document.createElement("aside");
  panel.className="mobile-nav-panel";
  panel.id="mobile-nav-panel";
  panel.setAttribute("aria-hidden","true");
  panel.innerHTML='<div class="mnp-header"><img src="'+logo+'" alt="'+CONFIG.siteName+' logo"><strong>Menu</strong><button class="mnp-close" id="mnp-close" aria-label="Close menu">&times;</button></div><nav class="mnp-links">'+mobileItems+'</nav><div class="mnp-social">'+
    mnpSocialIcon("facebook",social.facebook)+mnpSocialIcon("instagram",social.instagram)+mnpSocialIcon("youtube",social.youtube)+mnpSocialIcon("tiktok",social.tiktok)+mnpSocialIcon("whatsapp",waHeaderLink)+
    '</div>';
  document.body.appendChild(panel);
}

/* Desktop nav item — plain link, or a dropdown trigger + panel if it has children */
function buildDesktopNavItem(item) {
  if (!item.children || !item.children.length) {
    return '<a href="' + item.href + '" data-href="' + item.href + '">' + item.label + "</a>";
  }
  const childLinks = item.children
    .map(function (c) { return '<a href="' + c.href + '" data-href="' + c.href + '">' + c.label + "</a>"; })
    .join("");
  return (
    '<div class="nav-item has-dropdown">' +
    '  <a class="nav-top-link nav-parent-link" href="' + item.href + '" data-href="' + item.href + '">' + item.label + '</a>' +
    '  <button class="nav-dropdown-toggle" type="button" aria-label="Open ' + item.label + ' menu" aria-expanded="false">' +
    '    <svg class="chev" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg>' +
    '  </button>' +
    '  <div class="dropdown-menu">' + childLinks + "</div>" +
    "</div>"
  );
}

/* Mobile slide-out panel — appended once to <body>, reused across the site */
function buildMobileNavPanel() {
  if (document.getElementById("mobile-nav-panel")) return; // already built

  const accordionItems = CONFIG.navMenu.map(function (item, i) {
    if (!item.children || !item.children.length) {
      return '<a class="mnp-link" href="' + item.href + '" data-href="' + item.href + '">' + item.label + "</a>";
    }
    const subLinks = item.children
      .map(function (c) { return '<a href="' + c.href + '" data-href="' + c.href + '">' + c.label + "</a>"; })
      .join("");
    return (
      '<div class="mnp-item">' +
      '  <div class="mnp-parent-row">' +
      '    <a class="mnp-parent-link" href="' + item.href + '" data-href="' + item.href + '">' + item.label + '</a>' +
      '    <button class="mnp-toggle" type="button" aria-label="Open ' + item.label + ' submenu" aria-expanded="false" data-target="mnp-sub-' + i + '">' +
      '      <span class="mnp-icon">+</span>' +
      '    </button>' +
      '  </div>' +
      '  <div class="mnp-submenu" id="mnp-sub-' + i + '">' + subLinks + "</div>" +
      "</div>"
    );
  }).join("");

  const social = CONFIG.social || {};
  const waLink = social.whatsapp || (CONFIG.contact && CONFIG.contact.whatsapp ? "https://wa.me/" + CONFIG.contact.whatsapp : "#");
  const mnpSocial =
    mnpSocialIcon("facebook", social.facebook) +
    mnpSocialIcon("instagram", social.instagram) +
    mnpSocialIcon("youtube", social.youtube) +
    mnpSocialIcon("tiktok", social.tiktok) +
    mnpSocialIcon("whatsapp", waLink);

  const overlay = document.createElement("div");
  overlay.className = "mobile-nav-overlay";
  overlay.id = "mobile-nav-overlay";
  document.body.appendChild(overlay);

  const panel = document.createElement("aside");
  panel.className = "mobile-nav-panel";
  panel.id = "mobile-nav-panel";
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML =
    '<div class="mnp-header">' +
    '  <img src="' + CONFIG.logo + '" alt="' + CONFIG.siteName + ' logo" onerror="this.style.display=\'none\'">' +
    '  <strong>Menu</strong>' +
    '  <button class="mnp-close" id="mnp-close" aria-label="Close menu">&times;</button>' +
    "</div>" +
    '<nav class="mnp-links">' + accordionItems + "</nav>" +
    '<div class="mnp-cta"><a href="' + CONFIG.navCta.href + '" class="btn btn-primary">🔴 ' + CONFIG.navCta.label + "</a></div>" +
    '<div class="mnp-social">' + mnpSocial + "</div>";
  document.body.appendChild(panel);
}

function socialAsset(name){
  if(name === "instagram") return "assets/icons/instagram-user.png";
  if(name === "whatsapp") return "assets/icons/whatsapp-user.png";
  return "icons/" + name + ".svg";
}
function mnpSocialIcon(name, url) {
  if (!url) return "";
  return '<a href="' + url + '" aria-label="' + name + '" target="_blank" rel="noopener"><img src="' + socialAsset(name) + '" alt="" width="22" height="22"></a>';
}

/* ---------------------------------------------------------------------
   2. FOOTER — injected into <div id="site-footer"></div>
   --------------------------------------------------------------------- */
function buildFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;
  const social = CONFIG.social || {};
  const waLink = social.whatsapp || (CONFIG.contact && CONFIG.contact.whatsapp ? "https://wa.me/" + CONFIG.contact.whatsapp : "#");
  const address = (CONFIG.contact && CONFIG.contact.address) || "Kasana Kavule, Kampala, Uganda";
  const mapUrl = (CONFIG.contact && CONFIG.contact.mapEmbedUrl) || "https://www.google.com/maps?q=" + encodeURIComponent(address) + "&output=embed";
  const quickLinks = [
    ["Home","index.html"],["About Us","about.html"],["Ministries","ministries.html"],
    ["Leadership","pastors.html"],["Events","events.html"],["Sermons","sermons.html"],["Contact","contact.html"]
  ];
  mount.innerHTML =
    '<footer class="site-footer" id="footer">' +
    '  <div class="footer-top container">' +
    '    <div class="footer-brand-column">' +
    '      <a href="index.html" class="footer-brand"><img src="'+CONFIG.logo+'" alt="'+CONFIG.siteName+' logo"><span class="brand-text"><strong>HEALING TABERNACLE</strong><span>MINISTRIES</span></span></a>' +
    '      <p>A church committed to sharing the Gospel, transforming lives, and raising believers to reign in life through Jesus Christ.</p>' +
    '      <div class="social-links">'+socialIcon("facebook",social.facebook)+socialIcon("youtube",social.youtube)+socialIcon("instagram",social.instagram)+socialIcon("tiktok",social.tiktok)+socialIcon("whatsapp",waLink)+'</div>' +
    '    </div>' +
    '    <div class="footer-column"><h3>Quick Links</h3>'+quickLinks.map(function(l){return '<a href="'+l[1]+'">'+l[0]+'</a>';}).join('')+'</div>' +
    '    <div class="footer-column"><h3>Contact Us</h3>' +
    '      <p class="contact-item"><i>☎</i> '+(CONFIG.contact.phone || 'Phone available soon')+'</p>' +
    '      <p class="contact-item"><i>✉</i> '+(CONFIG.contact.email || 'Email available soon')+'</p>' +
    '      <p class="contact-item"><i>◷</i> Sunday: 7:00 AM – 1:00 PM</p>' +
    '      <p class="contact-item"><i>⌖</i> '+address+'</p>' +
    '    </div>' +
    '    <div class="footer-map-column"><h3>Our Location</h3><div class="map-container"><iframe src="'+mapUrl+'" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Church Location Map"></iframe></div><a class="map-button" href="'+mapUrl.replace('&output=embed','')+'" target="_blank" rel="noopener">Open in Maps →</a></div>' +
    '  </div>' +
    '  <div class="footer-bottom container"><p>© <span id="current-year"></span> '+CONFIG.siteName+'. All Rights Reserved.</p><div><a href="privacy.html">Privacy</a><span></span><a href="terms.html">Terms</a><span></span><a href="safeguarding.html">Safeguarding</a><span></span><a href="cookies.html">Cookies</a></div></div>' +
    '</footer>';
  const yearEl=document.getElementById("current-year"); if(yearEl) yearEl.textContent=new Date().getFullYear();
}

function socialIcon(name, url) {
  if (!url) return "";
  return '<a href="' + url + '" aria-label="' + name + '" target="_blank" rel="noopener"><img src="' + socialAsset(name) + '" alt="" width="22" height="22"></a>';
}

/* ---------------------------------------------------------------------
   3. SITE NAVIGATION — desktop dropdowns + mobile slide-out accordion.
   Handles: hamburger open/close, overlay + Escape + outside-click to
   close, body scroll-lock while open, accordion expand/collapse, desktop
   dropdown toggling (click, for touch/tablet + keyboard support), and
   closing everything after a link is followed.
   --------------------------------------------------------------------- */
function setupSiteNavigation() {
  const toggle = document.getElementById("nav-toggle");
  const overlay = document.getElementById("mobile-nav-overlay");
  const panel = document.getElementById("mobile-nav-panel");
  const closeBtn = document.getElementById("mnp-close");

  function openMobileNav() {
    if (!panel) return;
    panel.classList.add("open");
    overlay.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  }
  function closeMobileNav() {
    if (!panel) return;
    panel.classList.remove("open");
    overlay.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.contains("open") ? closeMobileNav() : openMobileNav();
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", closeMobileNav);
  if (overlay) overlay.addEventListener("click", closeMobileNav);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMobileNav();
      closeAllDesktopDropdowns();
    }
  });

  // Mobile accordion sections (+ / −)
  if (panel) {
    panel.querySelectorAll(".mnp-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const sub = document.getElementById(btn.getAttribute("data-target"));
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        // close sibling sections first for a clean single-open accordion
        panel.querySelectorAll(".mnp-toggle").forEach(function (b) {
          if (b !== btn) {
            b.setAttribute("aria-expanded", "false");
            const s = document.getElementById(b.getAttribute("data-target"));
            if (s) s.classList.remove("open");
            b.querySelector(".mnp-icon").textContent = "+";
          }
        });
        btn.setAttribute("aria-expanded", String(!isOpen));
        if (sub) sub.classList.toggle("open", !isOpen);
        btn.querySelector(".mnp-icon").textContent = isOpen ? "+" : "\u2212";
      });
    });
    // Close menu after any link inside it is followed
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMobileNav);
    });
  }


  // Safety fallback: every generated menu link with a local data-href must navigate.
  document.querySelectorAll('a[data-href]').forEach(function(link){
    link.addEventListener('click', function(e){
      const target = link.getAttribute('data-href');
      const href = link.getAttribute('href');
      if (target && (!href || href === '#')) {
        e.preventDefault();
        window.location.href = target;
      }
    });
  });

  // Make desktop parent labels open/close their submenu when clicked.
  document.querySelectorAll(".nav-parent-link").forEach(function(link){
    link.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      const item = link.closest(".nav-item");
      if(!item) return;
      const willOpen = !item.classList.contains("open");
      document.querySelectorAll(".nav-item.has-dropdown.open").forEach(function(el){
        if(el !== item) el.classList.remove("open");
      });
      document.querySelectorAll(".nav-dropdown-toggle").forEach(function(b){
        if(b.closest(".nav-item") !== item) b.setAttribute("aria-expanded","false");
      });
      item.classList.toggle("open", willOpen);
      const btn=item.querySelector(".nav-dropdown-toggle");
      if(btn) btn.setAttribute("aria-expanded", String(willOpen));
    });
  });

  // Mobile parent labels open/close their submenu when clicked.
  if (panel) {
    panel.querySelectorAll(".mnp-parent-link").forEach(function(link){
      link.addEventListener("click", function(e){
        e.preventDefault();
        const row=link.closest(".mnp-parent-row");
        const btn=row && row.querySelector(".mnp-toggle");
        if(btn) btn.click();
      });
    });
  }

  // Desktop dropdowns
  const navLinksEl = document.getElementById("nav-links");
  function closeAllDesktopDropdowns() {
    if (!navLinksEl) return;
    navLinksEl.querySelectorAll(".nav-item.open").forEach(function (el) { el.classList.remove("open"); });
    navLinksEl.querySelectorAll(".nav-dropdown-toggle").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
  }
  if (navLinksEl) {
    navLinksEl.querySelectorAll(".nav-dropdown-toggle").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const item = btn.closest(".nav-item");
        const willOpen = !item.classList.contains("open");
        closeAllDesktopDropdowns();
        if (willOpen) {
          item.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
    document.addEventListener("click", function (e) {
      if (!navLinksEl.contains(e.target)) closeAllDesktopDropdowns();
    });
    navLinksEl.querySelectorAll(".dropdown-menu a").forEach(function (a) {
      a.addEventListener("click", closeAllDesktopDropdowns);
    });
  }
}

/* Highlight the current page's nav link, both desktop and mobile markup */
function highlightActiveNavLink() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-href]").forEach(function (a) {
    if (a.getAttribute("data-href") === path) a.classList.add("active");
  });
}

/* ---------------------------------------------------------------------
   4. BACK TO TOP BUTTON
   --------------------------------------------------------------------- */
function setupBackToTop() {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "&uarr;";
  document.body.appendChild(btn);
  window.addEventListener("scroll", function () {
    btn.classList.toggle("visible", window.scrollY > 500);
  });
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------------------------------------------------------------------
   5. SCROLL REVEAL — add class "reveal" to any element to fade it in
   --------------------------------------------------------------------- */
function setupScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("visible"); });
    return;
  }
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach(function (el) { observer.observe(el); });
}

/* ---------------------------------------------------------------------
   6. GALLERY LIGHTBOX (used on gallery.html)
   Reads all elements with class "gallery-item" and their child <img>.
   --------------------------------------------------------------------- */
function setupGalleryLightbox() {
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  if (!items.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML =
    '<button class="lightbox-close" aria-label="Close">&times;</button>' +
    '<button class="lightbox-prev" aria-label="Previous">&#8249;</button>' +
    '<img src="" alt="">' +
    '<button class="lightbox-next" aria-label="Next">&#8250;</button>';
  document.body.appendChild(lightbox);

  const imgEl = lightbox.querySelector("img");
  let currentIndex = 0;

  function open(index) {
    currentIndex = index;
    const src = items[index].querySelector("img").getAttribute("src");
    const alt = items[index].querySelector("img").getAttribute("alt") || "";
    imgEl.setAttribute("src", src);
    imgEl.setAttribute("alt", alt);
    lightbox.classList.add("open");
  }
  function close() { lightbox.classList.remove("open"); }
  function nav(step) {
    currentIndex = (currentIndex + step + items.length) % items.length;
    open(currentIndex);
  }

  items.forEach(function (item, i) {
    item.addEventListener("click", function () { open(i); });
  });
  lightbox.querySelector(".lightbox-close").addEventListener("click", close);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { nav(-1); });
  lightbox.querySelector(".lightbox-next").addEventListener("click", function () { nav(1); });
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") nav(-1);
    if (e.key === "ArrowRight") nav(1);
  });

  /* Gallery category filters */
  const filterButtons = document.querySelectorAll(".gallery-filters button");
  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      const category = btn.getAttribute("data-filter");
      items.forEach(function (item) {
        const match = category === "all" || item.getAttribute("data-category") === category;
        item.style.display = match ? "" : "none";
      });
    });
  });
}

/* ---------------------------------------------------------------------
   7. CONTACT FORM — Firebase-backed administrator inbox.
   Public submissions are written to contactMessages; only authorized
   administrators can read them through the secure records area.
   --------------------------------------------------------------------- */
function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const alertBox = document.getElementById("form-alert");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Spam protection: if the honeypot field got filled in, it was a bot —
    // silently pretend success without actually sending anything.
    const honeypot = document.getElementById("hp-field");
    if (honeypot && honeypot.value) {
      form.reset();
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    (async function () {
      try {
        const { db } = await import("./firebase.js");
        const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js");
        const payload = {
          name: (document.getElementById("name") || document.getElementById("contact-name"))?.value?.trim() || "",
          email: (document.getElementById("email") || document.getElementById("contact-email"))?.value?.trim() || "",
          phone: (document.getElementById("phone") || document.getElementById("contact-phone"))?.value?.trim() || "",
          message: (document.getElementById("message") || document.getElementById("contact-message"))?.value?.trim() || "",
          subject: (document.getElementById("subject") || document.getElementById("contact-subject"))?.value?.trim() || "General Inquiry",
          source: "website-contact-form",
          status: "new", createdAt: serverTimestamp()
        };
        let deliveryId = "";
        try {
          const messageRef = await addDoc(collection(db, "contactMessages"), payload);
          deliveryId = messageRef.id;
        } catch (sdkError) {
          // A REST fallback helps when a browser has a Firebase SDK/network issue.
          // Firestore Security Rules still protect the write.
          const cfg = { projectId: "healing-tabernacle-centre-nabw", apiKey: "AIzaSyCYPz0xFZX-rZeMqLnYPCNjgJZnbBmlVMc" };
          const restUrl = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/contactMessages?key=${encodeURIComponent(cfg.apiKey)}`;
          const body = { fields: {
            name:{stringValue:payload.name}, email:{stringValue:payload.email}, phone:{stringValue:payload.phone},
            subject:{stringValue:payload.subject}, message:{stringValue:payload.message}, source:{stringValue:payload.source},
            status:{stringValue:"new"}, createdAt:{timestampValue:new Date().toISOString()}
          }};
          const response = await fetch(restUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
          if(!response.ok){
            const detail = await response.text().catch(()=>"");
            const restErr = new Error(`Firestore REST ${response.status}: ${detail}`);
            restErr.code = response.status === 403 ? "permission-denied" : "rest-error";
            throw restErr;
          }
          const created = await response.json();
          deliveryId = String(created.name || "").split("/").pop();
          console.warn("Firebase SDK submission failed; REST fallback delivered the contact message.", sdkError);
        }
        console.info("Contact message delivered to Firebase:", deliveryId);
        if (alertBox) { alertBox.textContent = `Thank you! Your message has been received and delivered to the church administrator inbox${deliveryId ? ` (Reference: ${deliveryId})` : ""}.`; alertBox.className = "form-alert success"; }
        form.reset();
      } catch (err) {
        console.error("Contact submission failed", err);
        const code = err?.code || "";
        let detail = "We could not send the message right now. Please try again.";
        if (code === "permission-denied") detail = "The contact inbox is not accepting public messages yet. Please contact the church by phone or WhatsApp while the Firebase rules are being deployed.";
        else if (code === "failed-precondition") detail = "The church contact inbox needs a Firebase configuration update before it can receive messages.";
        else if (code === "unavailable" || /network/i.test(err?.message || "")) detail = "The internet connection to the church contact inbox was interrupted. Please check your connection and try again.";
        if (alertBox) { alertBox.textContent = detail; alertBox.className = "form-alert error"; }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    })();
  });
}

/* ---------------------------------------------------------------------
   8. Populate elements driven by CONFIG (pastor info, contact info, etc.)
   Add data-config="path.to.value" to any element and this will fill it.
   Example: <span data-config="contact.phone"></span>
   --------------------------------------------------------------------- */
function populateConfigDrivenElements() {
  document.querySelectorAll("[data-config]").forEach(function (el) {
    const path = el.getAttribute("data-config").split(".");
    let value = CONFIG;
    path.forEach(function (key) { value = value && value[key]; });
    if (value === undefined || value === null) return;
    if (el.tagName === "IMG") {
      el.setAttribute("src", value);
    } else if (el.tagName === "A" && el.hasAttribute("data-config-href")) {
      el.setAttribute("href", value);
    } else {
      el.textContent = value;
    }
  });

  // Service times list (used on homepage + about page): container with id="service-times-list"
  const valuesList = document.getElementById("core-values-list");
  if (valuesList && CONFIG.about && Array.isArray(CONFIG.about.coreValues)) {
    valuesList.innerHTML = CONFIG.about.coreValues.map(function(v, i) {
      const icons = ["✟", "✚", "🤝", "🌍", "❤", "⭐"];
      return '<div class="card value-card reveal"><div class="ministry-icon">' + (icons[i % icons.length]) + '</div><h3>' + (v.title || "") + '</h3><p>' + (v.text || "") + '</p></div>';
    }).join("");
  }

  const leadersList = document.getElementById("leadership-list");
  if (leadersList && Array.isArray(CONFIG.leadership)) {
    leadersList.innerHTML = CONFIG.leadership.map(function(l) {
      const name = l.name || "Church Leader";
      const image = l.image || "assets/images/placeholder.jpg";
      const waNumber = (l.whatsapp || (CONFIG.contact && CONFIG.contact.whatsapp) || "").replace(/\D/g, "");
      const waUrl = waNumber ? "https://wa.me/" + waNumber + "?text=" + encodeURIComponent("Hello " + name + ", I am contacting you through the Healing Tabernacle Ministries website.") : "contact.html";
      const actionText = waNumber ? "WhatsApp Chat" : "Contact Leadership";
      const initials = name.split(/\s+/).filter(Boolean).slice(0,2).map(function(part){ return part.charAt(0); }).join("");
      return '<article class="card team-card reveal">' +
        '<div class="leader-photo-wrap">' +
          '<div class="arch-frame"><img loading="lazy" src="' + image + '" alt="' + name + '" onerror="this.style.display=\'none\';this.parentNode.classList.add(\'leader-image-missing\');this.parentNode.setAttribute(\'data-initials\', \'" + initials + "\');"></div>' +
        '</div>' +
        '<h3>' + name + '</h3><span class="role">' + (l.role || "") + '</span>' +
        (l.bio ? '<p class="leader-bio">' + l.bio + '</p>' : '') +
        '<div class="leader-card-actions"><a class="leader-chat-btn" href="' + waUrl + '"' + (waNumber ? ' target="_blank" rel="noopener"' : '') + '>💬 ' + actionText + '</a></div>' +
      '</article>';
    }).join("");
  }

  const stList = document.getElementById("service-times-list");
  if (stList) {
    stList.innerHTML = CONFIG.serviceTimes
      .map(function (s) {
        return '<div><strong>' + s.day + "</strong><span>" + s.time + " — " + s.label + "</span></div>";
      })
      .join("");
  }
}

/* ---------------------------------------------------------------------
   10. FLOATING WHATSAPP BUTTON — appears on every page.
   Quick options link to Prayer, Giving, Membership, or a general chat.
   Edit the number in CONFIG.contact.whatsapp (js/config.js).
   --------------------------------------------------------------------- */
function setupWhatsAppButton() {
  const num = CONFIG.contact && CONFIG.contact.whatsapp;
  const chatBase = num ? 'https://wa.me/' + num : 'contact.html';
  const chatLink = function(message) {
    return num ? chatBase + '?text=' + encodeURIComponent(message) : chatBase;
  };

  const wrap = document.createElement("div");
  wrap.className = "wa-float";
  wrap.innerHTML =
    '<div class="wa-menu" id="wa-menu">' +
      '<a href="' + chatLink("Hi, I'd like someone to pray with me.") + '" target="_blank" rel="noopener">🙏 Prayer</a>' +
      '<a href="give.html">💛 Giving</a>' +
      '<a href="join.html">🤝 Membership</a>' +
      '<a href="' + chatLink("Hi, I have a question for Healing Tabernacle.") + '" target="_blank" rel="noopener">💬 General Enquiry</a>' +
    '</div>' +
    '<button class="wa-toggle" aria-label="Chat with us on WhatsApp">' +
      '<img class="wa-custom-icon" src="assets/icons/whatsapp-user.png" alt="">' +
    '</button>';
  document.body.appendChild(wrap);

  wrap.querySelector(".wa-toggle").addEventListener("click", function () {
    wrap.classList.toggle("open");
  });
  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) wrap.classList.remove("open");
  });
}

/* ---------------------------------------------------------------------
   11. TODAY'S WORD + ANNOUNCEMENTS — used on index.html / daily-word.html
   --------------------------------------------------------------------- */
function populateDailyWord() {
  const el = document.getElementById("daily-word");
  if (el && CONFIG.dailyWord) {
    el.querySelector(".dw-date").textContent = CONFIG.dailyWord.date;
    el.querySelector(".dw-verse").textContent = CONFIG.dailyWord.verse;
    el.querySelector(".dw-reference").textContent = CONFIG.dailyWord.reference;
    el.querySelector(".dw-message").textContent = CONFIG.dailyWord.message;
    const shareLink = el.querySelector(".dw-share");
    if (shareLink) {
      const text = CONFIG.dailyWord.verse + " — " + CONFIG.dailyWord.reference + "\n\n" + CONFIG.dailyWord.message;
      shareLink.href = "https://wa.me/?text=" + encodeURIComponent(text);
    }
  }

  const prevList = document.getElementById("previous-devotionals");
  if (prevList && CONFIG.previousDevotionals) {
    prevList.innerHTML = CONFIG.previousDevotionals.map(function (d) {
      return '<div class="pay-row"><div><div class="pay-label">' + d.date + '</div>' +
        '<div class="pay-value" style="font-size:0.95rem;">' + d.verse + '</div></div>' +
        '<span style="color:var(--color-text-light);font-size:0.85rem;white-space:nowrap;">' + d.reference + '</span></div>';
    }).join("");
  }
}

function populateAnnouncements() {
  const el = document.getElementById("announcements-list");
  if (!el || !CONFIG.announcements) return;
  el.innerHTML = CONFIG.announcements.map(function (a) {
    return '<div class="event-row" style="grid-template-columns:90px 1fr;">' +
      '<div class="event-date-badge"><span class="day" style="font-size:1rem;">' + a.date + '</span></div>' +
      '<div><h3 style="margin-bottom:4px;">' + a.title + '</h3><p style="margin:0;color:var(--color-text-light);">' + a.detail + '</p></div>' +
    '</div>';
  }).join("");
}

/* ---------------------------------------------------------------------
   12. Livestream status pill (used on livestream.html)
   --------------------------------------------------------------------- */
function setupLivestreamStatus() {
  const el = document.getElementById("livestream-status");
  if (!el) return;
  if (CONFIG.liveStreamIsLive) {
    el.innerHTML = '<span class="dot"></span> LIVE NOW';
  } else {
    el.innerHTML = '<span class="dot" style="background:#8a978f;animation:none;"></span> OFFLINE — CHECK BACK AT SERVICE TIME';
  }
}

/* Temporary website-completion safeguards: keep unconfigured links from navigating to broken placeholders. */
document.addEventListener('click', function (event) {
  const link = event.target.closest('a[href="#"]');
  if (!link) return;
  if (link.id === 'logout' || link.classList.contains('dw-share')) return;
  event.preventDefault();
  if (!document.getElementById('ht-coming-soon-toast')) {
    const toast = document.createElement('div');
    toast.id = 'ht-coming-soon-toast';
    toast.textContent = 'This information will be available soon.';
    toast.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99999;background:#21113f;color:#fff;padding:12px 18px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.25);font-weight:600;max-width:90vw;text-align:center;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }
});
