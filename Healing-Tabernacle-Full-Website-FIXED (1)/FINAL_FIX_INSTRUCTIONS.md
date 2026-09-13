# FINAL FIX — Firebase save/contact

## What was changed

1. `js/admin-settings.js`
   - Website Settings now saves directly to Firestore at `siteSettings/general`.
   - This removes the dependency on the `saveSiteSettings` Cloud Function and avoids browser `Failed to fetch`/CORS failures.
   - Firestore Security Rules still protect the write: the signed-in user must have role `admin` or `pastor`.

2. `js/contact-form.js`
   - Contact Us now writes directly to Firestore collection `contactMessages`.
   - New messages use `status: "new"`, matching the public Firestore create rule.
   - A delivery/reference ID is shown after Firestore accepts the message.

3. `firestore.rules`
   - The ZIP already contains rules that allow:
     - public creation of `contactMessages` only when `status == "new"`
     - admin/pastor management of `siteSettings`
   - These rules MUST be deployed to Firebase.

## Android deployment

Do this from the website root in your terminal app:

```bash
firebase login
firebase use healing-tabernacle-centre-nabw
firebase deploy --only firestore:rules,storage,hosting
```

Cloud Functions are no longer required for Website Settings or Contact Us. You can deploy them later if other website features use them:

```bash
firebase deploy --only functions
```

After deployment:
1. Open the live admin login.
2. Sign in with the administrator account.
3. Open Website Settings.
4. Change one small setting and press Save.
5. Open Contact Us on the public website and send a test message.
6. Open Secure Messages & Records → Contact Messages and confirm the message appears.

IMPORTANT:
- Do not use Firestore "Develop & Test" rules as the final production configuration.
- The Firebase project must be `healing-tabernacle-centre-nabw`.
