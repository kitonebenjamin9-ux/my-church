# Healing Tabernacle Ministries — Production Completion Pass

This package contains the current website plus a broad production-readiness pass.

## Completed in this pass

- Firebase-connected website retained.
- Bible reader repaired to use the complete KJV CDN corpus with fallback and device caching.
- Bible appearance controls retained.
- Bible verse saving/bookmarking added using local device storage.
- Member dashboard login now routes members to the dashboard instead of directly to Prayer.
- Member dashboard shows saved-verse count and Bible shortcut.
- Progressive Web App manifest added.
- Service worker added for same-origin core-page caching and offline fallback.
- Offline page added.
- Global website search page added, including 46 branch search and Firebase-backed public content search.
- Search shortcut added to the public header and Ctrl/Cmd+K shortcut added.
- Network online/offline status feedback added.
- Privacy Policy page added.
- Terms & Conditions page added.
- Cookie & Local Storage notice added.
- Safeguarding & Child Protection page added.
- Media & Copyright Policy page added.
- Footer legal links expanded.
- Accessibility skip links and semantic main regions preserved/expanded on new pages.
- Existing 46 connected branch structure retained.
- Existing admin, media, events, prayer, sermons, giving and notification modules retained.

## Still requires real church/provider configuration

These cannot be truthfully completed with invented credentials:

1. Firebase cloud deployment must be performed by an authenticated Firebase project owner/admin.
2. Real church phone, email, WhatsApp and social URLs should be entered.
3. Actual YouTube/Facebook livestream embed URL and live-status workflow should be configured.
4. Actual payment provider credentials/API integration is required for automated card/mobile-money payments.
5. Real branch pastors, phone numbers, emails, addresses and coordinates should replace placeholders.
6. Firebase/Google Cloud billing may be required for scheduled Cloud Functions/Cloud Scheduler.
7. Production email/SMS/push provider credentials are required for outbound notifications.

## Deployment

From the project directory after installing/authenticating Firebase CLI:

```bash
firebase login
firebase use healing-tabernacle-centre-nabw
firebase deploy --only firestore:rules,storage,functions,hosting
```

Test after deployment:

- `/`
- `/bible.html`
- `/search.html`
- `/login.html`
- `/dashboard.html`
- `/admin-login.html`
- `/admin.html`
- `/branches.html`
- at least 3 branch microsites
- `/livestream.html`
- `/give.html`

## Bible note

The Bible reader uses the public-domain KJV corpus served through a CDN and stores opened chapters in local browser storage. This means chapters already opened on a device remain available when the connection is lost. A truly zero-network first-load Bible would require bundling the complete KJV corpus into the package, which would substantially increase package size; this package keeps the site lighter while retaining offline caching.
