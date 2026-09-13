# Healing Tabernacle Website — Final Deployment Checklist

This ZIP has been audited and improved, but these external production settings cannot be truthfully completed without the church's real accounts and credentials:

1. Add the official YouTube/Facebook livestream embed URL.
2. Add official social-media URLs.
3. Add church phone, email and WhatsApp details.
4. Verify Firebase project configuration and security rules.
5. Create production admin users and role permissions.
6. Populate Firestore with real sermons, events, announcements, testimonies and gallery items.
7. Configure Firebase Cloud Messaging if browser push notifications are required.
8. Test payment/giving instructions with the church's real approved account details.
9. Deploy to HTTPS hosting and test all forms on mobile.
10. Review sitemap.xml and domain URLs after the final domain is chosen.

Completed audit improvements in this pass:
- Removed the REPLACE_WITH_CHANNEL_ID livestream placeholder.
- Added a safe livestream empty state and config-driven player.
- Removed an unrelated placeholder sermon video.
- Updated church identity/location content in the central configuration.
- Updated leadership defaults.
- Updated stale devotional dates to September 2026.
- Preserved the existing Firebase-based project structure.

Do not expose Firebase service-account keys or other private credentials in public JavaScript files.
