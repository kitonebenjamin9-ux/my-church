# Healing Tabernacle — Admin & Contact Fix

## What was fixed
1. The public Contact Us form now writes submissions to Firestore collection `contactMessages`.
2. Successful submissions show a clear success message and reset the form.
3. Firebase permission errors are shown instead of failing silently.
4. The main admin dashboard no longer immediately signs the user out/redirects when the Firestore profile is missing or has the wrong role; it keeps the page open so the problem can be diagnosed.

## Required Firebase setup
After uploading this website, deploy the Firestore rules and Cloud Functions from the Firebase project directory:

```bash
firebase use healing-tabernacle-centre-nabw
firebase deploy --only firestore:rules,functions,hosting
```

The commands must be run in the folder containing `firebase.json` (the root of this website project). On an Android phone, this can be done from a cloud/online terminal or a computer with Firebase CLI installed.

## Admin profile
The Firebase Authentication account must also have a Firestore document:

`users/<YOUR_AUTH_UID>`

with at least:

```json
{
  "role": "admin",
  "name": "Administrator"
}
```

The role must be `admin` or `pastor` (lowercase is safest).

## Testing
- Submit Contact Us while logged out. It should create a `contactMessages` document with `status: "new"`.
- Sign into Admin.
- Open Secure Messages & Records and verify the message appears.
- If Admin says access is denied, check Authentication for the signed-in account's UID, then check Firestore `users/<UID>` and set `role` to `admin`.
