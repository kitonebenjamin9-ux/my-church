# Healing Tabernacle website repair — deployment guide

This repair moves the two failing public/admin writes through Firebase Cloud Functions:

- `saveSiteSettings`: verifies the signed-in Firebase account and requires role `admin` or `pastor`, then saves `siteSettings/general` or `siteSettings/branches` with the Admin SDK.
- `submitContactMessage`: validates the public Contact form and writes `contactMessages` with the Admin SDK.

The Firestore rules remain restrictive; do not make the database public-write just to fix the error.

## From the project folder

Run these commands in the folder containing `firebase.json`:

```bash
firebase login
firebase use healing-tabernacle-centre-nabw
firebase deploy --only functions,firestore:rules,hosting
```

If Firebase CLI says the project is not selected, run:

```bash
firebase use healing-tabernacle-centre-nabw
```

## After deployment

1. Open the live website, not an old cached localhost copy.
2. Sign in through `admin-login.html`.
3. Open Website Settings.
4. Change one harmless field and press **Save All Website Settings**.
5. Confirm the green success message.
6. Open Contact Us in a private/incognito tab, submit a test message, and confirm it appears under **Secure Messages & Ministry Records → Contact Messages**.
7. If the browser has cached the old JavaScript, refresh twice or clear the site's cached data.

## Important

The Cloud Functions use the project's default `us-central1` region, so the website calls:

`https://us-central1-healing-tabernacle-centre-nabw.cloudfunctions.net/saveSiteSettings`

`https://us-central1-healing-tabernacle-centre-nabw.cloudfunctions.net/submitContactMessage`
