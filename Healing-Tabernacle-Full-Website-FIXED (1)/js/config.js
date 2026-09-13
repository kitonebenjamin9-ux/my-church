/* =========================================================================
   CONFIG.js — HEALING TABERNACLE SITE CONFIGURATION
   =========================================================================
   This is the ONE file you should edit first. It controls the church name,
   logo, pastor info, contact details, service times, social links, the
   livestream URL, and the main navigation menu across every page.

   HOW IT WORKS:
   js/main.js reads this CONFIG object and automatically builds the header
   (nav bar) and footer on every public page, so you only edit them here —
   not on every single HTML file.
   ========================================================================= */

const CONFIG = {

  /* ---- CHURCH IDENTITY --------------------------------------------- */
  siteName: "Healing Tabernacle Ministries",
  tagline: "The Governing Church — Reigning In Life As Kings Through One Jesus Christ",

  // CHANGE CHURCH LOGO HERE — replace the file at this path
  logo: "assets/logo/church-logo-transparent.png",

  // Used as a fallback logo if the main logo image fails to load
  logoFallbackText: "HT",

  /* ---- PASTOR / LEADERSHIP ------------------------------------------ */
  pastor: {
    name: "Bishop Richard Kabenge",
    title: "Senior Pastor, Healing Tabernacle Ministries",
    // CHANGE PASTOR IMAGE HERE — replace the file at this path
    image: "assets/images/pastor.jpg",
    bio: "Bishop Richard Kabenge serves as the senior pastor of Healing Tabernacle Ministries, committed to teaching the Word of God and helping people reign in life through one Jesus Christ.",
    quote: "Healing is not just our name — it is our mission."
  },

  /* ---- ABOUT / MISSION / VISION / CORE VALUES ------------------------ */
  about: {
    storyTitle: "Founded on Faith, Built on Community",
    storyText1: "Healing Tabernacle Ministries is a growing church family in Uganda, gathered around the Word of God, prayer, worship and practical care for people. We are committed to helping believers grow strong in Christ and live with faith, purpose and hope.",
    storyText2: "From worship services and Bible teaching to prayer, discipleship, outreach and ministry for every generation, our desire is to see lives strengthened through Jesus Christ. Our church family is built to welcome people, teach the Word and help believers reign in life through one Jesus Christ.",
    vision: "To raise believers who know Christ, live by the Word of God and reign in life through one Jesus Christ, bringing hope and transformation to families and communities.",
    mission: "To preach and teach the Gospel of Jesus Christ, build strong disciples, strengthen families, raise leaders and serve our community through prayer, worship and practical ministry.",
    governance: "Healing Tabernacle Ministries is guided by its pastoral leadership and church leadership structure, providing spiritual direction, accountability, discipleship and care for the church family.",
    coreValues: [
      { title: "The Bible", text: "We believe Scripture is God's inspired, authoritative word for daily living." },
      { title: "Healing", text: "We believe God still heals bodies, hearts and relationships today." },
      { title: "Community", text: "We're called to walk out our faith together, not alone." },
      { title: "Mission", text: "We exist to serve our community and share the Gospel beyond our walls." }
    ]
  },

  /* ---- LEADERSHIP TEAM ----------------------------------------------- */
  leadership: [
    {
      name: "Bishop Richard Kabenge",
      role: "Senior Pastor",
      bio: "Bishop Richard Kabenge provides spiritual leadership to Healing Tabernacle Ministries, with a commitment to teaching the Word of God, prayer and helping believers reign in life through one Jesus Christ.",
      image: "assets/images/pastor.jpg",
      whatsapp: ""
    },
    {
      name: "Mom Evelyn M. Kabenge",
      role: "Church Leadership",
      bio: "Mom Evelyn M. Kabenge serves the Healing Tabernacle family alongside the church leadership team, encouraging spiritual growth, care, prayer and strong families within the church community.",
      image: "assets/images/placeholder.jpg",
      whatsapp: ""
    }
  ],

  /* ---- CONTACT & LOCATION -------------------------------------------- */
  contact: {
    address: "Kasana Kavule, Kampala, Uganda",
    phone: "",
    email: "",
    // CHANGE WHATSAPP NUMBER HERE — digits only, with country code, no + or spaces
    whatsapp: "",
    // CHANGE GOOGLE MAP EMBED URL HERE (contact.html)
    mapEmbedUrl: ""
  },

  /* ---- TODAY'S WORD (homepage + daily-word.html) — CHANGE DAILY --------- */
  dailyWord: {
    date: "Today",
    verse: "\u201cHe heals the brokenhearted and binds up their wounds.\u201d",
    reference: "Psalm 147:3",
    message: "No matter what today looks like, God is near to the wounded places in your life. Bring Him what's broken — He is still in the business of making things whole."
  },
  previousDevotionals: [
    { date: "September 5, 2026", verse: "\u201cThe Lord is my shepherd; I shall not want.\u201d", reference: "Psalm 23:1" },
    { date: "August 7, 2026", verse: "\u201cI can do all things through Christ who strengthens me.\u201d", reference: "Philippians 4:13" },
    { date: "August 6, 2026", verse: "\u201cBe still, and know that I am God.\u201d", reference: "Psalm 46:10" }
  ],

  /* ---- ANNOUNCEMENTS — "This Week At Healing Tabernacle" ---------------- */
  announcements: [
    { title: "Church Announcements", date: "Updates", detail: "The latest church announcements will appear here." },
    { title: "Upcoming Events", date: "Soon", detail: "Upcoming services and ministry events will be published here." },
    { title: "Stay Connected", date: "Online", detail: "Check back regularly for the latest Healing Tabernacle updates." }
  ],

  /* ---- SERVICE TIMES (shown on homepage + about page) ---------------- */
  serviceTimes: [
    { day: "Sunday", time: "8:00 AM & 10:30 AM", label: "Sunday Worship Service" },
    { day: "Wednesday", time: "6:00 PM", label: "Midweek Bible Study" },
    { day: "Friday", time: "6:30 PM", label: "Prayer & Deliverance Night" }
  ],

  /* ---- SOCIAL LINKS — replace # / empty strings with your real channel
     URLs. These power the footer icons and the mobile menu icons.
     - whatsapp: paste a full https://wa.me/... link, or leave blank to
       fall back to CONFIG.contact.whatsapp automatically. ---------------- */
  social: {
    facebook: "#",
    instagram: "#",
    youtube: "#",
    tiktok: "#",
    whatsapp: ""
  },

  /* ---- LIVESTREAM ------------------------------------------------------
     Paste a YouTube/Facebook "embed" URL here. This one field controls the
     livestream.html page player. Example YouTube embed format:
     https://www.youtube.com/embed/VIDEO_ID
  ------------------------------------------------------------------------ */
  liveStreamEmbedUrl: "", // Add your actual YouTube/Facebook embed URL in Firebase/admin settings before going live
  liveStreamIsLive: false, // set to true when a service is actively streaming

  /* ---- MAIN NAVIGATION MENU ------------------------------------------
     Edit labels/links/order here. Any item can optionally have a
     "children" array — those render as a dropdown on desktop and an
     expandable (+/−) accordion section in the mobile slide-out menu.
     This ONE structure drives desktop nav, mobile nav, and active-link
     highlighting on every page automatically via js/main.js. ------------ */
  navMenu: [
    { label: "Home", href: "index.html" },
    { label: "About", href: "about.html", children: [
        { label: "Our Beliefs", href: "about.html#beliefs" },
        { label: "Vision & Mission", href: "about.html#vision" },
        { label: "Our History", href: "about.html#story" },
        { label: "Leadership", href: "leadership-board.html" },
        { label: "Plan Your Visit", href: "visit.html" }
      ]
    },
    { label: "Ministries", href: "ministries.html", children: [
        { label: "All Ministries", href: "ministries.html" },
        { label: "Children Ministry", href: "children-ministry.html" },
        { label: "Youth Ministry", href: "youth-ministry.html" },
        { label: "Men & Women Ministry", href: "men-women-ministry.html" },
        { label: "Prayer Ministry", href: "prayer.html" },
        { label: "Worship Team", href: "worship-team.html" },
        { label: "Evangelism Ministry", href: "evangelism-ministry.html" }
      ]
    },
    { label: "Events", href: "events.html" },
    { label: "Sermons", href: "sermons.html", children: [
        { label: "Latest Sermons", href: "sermons.html" },
        { label: "Audio Sermons", href: "audio-sermons.html" },
        { label: "Daily Broadcast", href: "daily-broadcast.html" },
        { label: "Podcasts", href: "podcasts.html" }
      ]
    },
    { label: "Gallery", href: "gallery.html", children: [
        { label: "Photos", href: "gallery.html" },
        { label: "Video Testimonies", href: "testimonies.html" }
      ]
    },
    { label: "Give", href: "give.html", children: [
        { label: "Give Online", href: "give.html" },
        { label: "How to Give", href: "how-to-give.html" },
        { label: "Airtel Money", href: "giving-airtel.html" },
        { label: "MTN Mobile Money", href: "giving-mtn.html" },
        { label: "Bank Giving", href: "giving-bank.html" }
      ]
    },
    { label: "Branches", href: "branches.html", children: [
        { label: "All Branches", href: "branches.html" },
        { label: "Adjumani Branch", href: "branches/adjumani/index.html" },
        { label: "Apac Branch", href: "branches/apac/index.html" },
        { label: "Arua Branch", href: "branches/arua/index.html" },
        { label: "Budaka Branch", href: "branches/budaka/index.html" },
        { label: "Bushenyi Branch", href: "branches/bushenyi/index.html" },
        { label: "Busia Branch", href: "branches/busia/index.html" },
        { label: "Dokolo Branch", href: "branches/dokolo/index.html" },
        { label: "Entebbe Branch", href: "branches/entebbe/index.html" },
        { label: "Fort Portal Branch", href: "branches/fort-portal/index.html" },
        { label: "Gulu Branch", href: "branches/gulu/index.html" },
        { label: "Hoima Branch", href: "branches/hoima/index.html" },
        { label: "Iganga Branch", href: "branches/iganga/index.html" },
        { label: "Jinja Branch", href: "branches/jinja/index.html" },
        { label: "Kabale Branch", href: "branches/kabale/index.html" },
        { label: "Kampala Branch", href: "branches/kampala/index.html" },
        { label: "Kamuli Branch", href: "branches/kamuli/index.html" },
        { label: "Kapchorwa Branch", href: "branches/kapchorwa/index.html" },
        { label: "Kasese Branch", href: "branches/kasese/index.html" },
        { label: "Kayunga Branch", href: "branches/kayunga/index.html" },
        { label: "Kiboga Branch", href: "branches/kiboga/index.html" },
        { label: "Kira Branch", href: "branches/kira/index.html" },
        { label: "Kitgum Branch", href: "branches/kitgum/index.html" },
        { label: "Kotido Branch", href: "branches/kotido/index.html" },
        { label: "Kumi Branch", href: "branches/kumi/index.html" },
        { label: "Kyenjojo Branch", href: "branches/kyenjojo/index.html" },
        { label: "Lira Branch", href: "branches/lira/index.html" },
        { label: "Luwero Branch", href: "branches/luwero/index.html" },
        { label: "Lyantonde Branch", href: "branches/lyantonde/index.html" },
        { label: "Masaka Branch", href: "branches/masaka/index.html" },
        { label: "Masindi Branch", href: "branches/masindi/index.html" },
        { label: "Mbale Branch", href: "branches/mbale/index.html" },
        { label: "Mbarara Branch", href: "branches/mbarara/index.html" },
        { label: "Mityana Branch", href: "branches/mityana/index.html" },
        { label: "Moroto Branch", href: "branches/moroto/index.html" },
        { label: "Mubende Branch", href: "branches/mubende/index.html" },
        { label: "Mukono Branch", href: "branches/mukono/index.html" },
        { label: "Nansana Branch", href: "branches/nansana/index.html" },
        { label: "Nebbi Branch", href: "branches/nebbi/index.html" },
        { label: "Ntungamo Branch", href: "branches/ntungamo/index.html" },
        { label: "Pallisa Branch", href: "branches/pallisa/index.html" },
        { label: "Rakai Branch", href: "branches/rakai/index.html" },
        { label: "Rukungiri Branch", href: "branches/rukungiri/index.html" },
        { label: "Soroti Branch", href: "branches/soroti/index.html" },
        { label: "Tororo Branch", href: "branches/tororo/index.html" },
        { label: "Wakiso Branch", href: "branches/wakiso/index.html" },
        { label: "Yumbe Branch", href: "branches/yumbe/index.html" },
      ] },
    { label: "Contact", href: "contact.html" }
  ],

  navCta: { label: "Give", href: "give.html" },

  /* ---- ADMIN BAR ------------------------------------------------------
     A small link shown in the top-right corner of every public page,
     leading to the admin login. Set show:false to hide it. -------------- */
  adminBar: { show: true, label: "Admin Login", href: "admin-login.html" },

  /* ---- FOOTER LINK COLUMNS -------------------------------------------- */
  footerColumns: [
    { title: "Our Branches", links: [
        { label: "Our Branches", href: "branches.html" },
        { label: "All Branches", href: "branches.html" }
      ]
    },
    { title: "Church", links: [
        { label: "About Us", href: "about.html" },
        { label: "Our Pastors", href: "pastors.html" },
        { label: "Ministries", href: "ministries.html" },
        { label: "Plan Your Visit", href: "visit.html" },
        { label: "Join Us", href: "join.html" }
      ]
    },
    { title: "Connect", links: [
        { label: "Prayer Request", href: "prayer.html" },
        { label: "Testimonies", href: "testimonies.html" },
        { label: "Events", href: "events.html" },
        { label: "Contact Us", href: "contact.html" },
        { label: "FAQ", href: "faq.html" }
      ]
    },
    { title: "Resources", links: [
        { label: "Sermons", href: "sermons.html" },
        { label: "Livestream", href: "livestream.html" },
        { label: "Daily Word", href: "daily-word.html" },
        { label: "Gallery", href: "gallery.html" },
        { label: "Notifications", href: "notifications.html" },
        { label: "Audio & PDFs", href: "media-library.html" }
      ]
    },
    { title: "Give", links: [
        { label: "Give Online", href: "give.html" },
        { label: "MTN Mobile Money", href: "giving-mtn.html" },
        { label: "Airtel Money", href: "giving-airtel.html" },
        { label: "Bank Giving", href: "giving-bank.html" }
      ]
    }
  ],

};

/* =========================================================================
   LIVE ADMIN OVERRIDES
   =========================================================================
   Firebase is now the source of truth for administrator changes.
   The public site loads siteSettings/general through js/site-settings.js
   before building the header, footer and page content.
   ========================================================================= */
(function applyLegacyLocalOverrides() {
  try {
    var settings = JSON.parse(localStorage.getItem("ht_admin_settings") || "null");
    if (settings) {
      if (Object.prototype.hasOwnProperty.call(settings, "siteName")) CONFIG.siteName = settings.siteName;
      if (Object.prototype.hasOwnProperty.call(settings, "tagline")) CONFIG.tagline = settings.tagline;
      if (Object.prototype.hasOwnProperty.call(settings, "address")) CONFIG.contact.address = settings.address;
      if (Object.prototype.hasOwnProperty.call(settings, "phone")) CONFIG.contact.phone = settings.phone;
      if (Object.prototype.hasOwnProperty.call(settings, "email")) CONFIG.contact.email = settings.email;
      if (Object.prototype.hasOwnProperty.call(settings, "facebook")) CONFIG.social.facebook = settings.facebook;
      if (Object.prototype.hasOwnProperty.call(settings, "instagram")) CONFIG.social.instagram = settings.instagram;
      if (Object.prototype.hasOwnProperty.call(settings, "youtube")) CONFIG.social.youtube = settings.youtube;
      if (Object.prototype.hasOwnProperty.call(settings, "tiktok")) CONFIG.social.tiktok = settings.tiktok;
      if (Object.prototype.hasOwnProperty.call(settings, "whatsapp")) CONFIG.social.whatsapp = settings.whatsapp;
      if (Object.prototype.hasOwnProperty.call(settings, "livestream")) CONFIG.liveStreamEmbedUrl = settings.livestream;
    }
  } catch (e) {}
})();

// Temporary-safe placeholders: real church contact and social details can be added later.
window.HTC_PLACEHOLDER_MODE = true;
