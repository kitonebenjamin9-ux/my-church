# Healing Tabernacle — Firebase/Admin Setup & Final Test Guide

## A. Create/verify the administrator

1. Open Firebase Console for project `healing-tabernacle-centre-nabw`.
2. Go to **Authentication → Users**.
3. Create or locate the administrator account and copy its **User UID**.
4. Go to **Firestore Database → Data**.
5. Open/create collection `users`.
6. Create a document whose **Document ID is exactly the Authentication UID**.
7. Add fields:
   - `role` = `admin` (string)
   - `name` = the administrator's display name (string)
   - `email` = the administrator email (string, optional but recommended)
8. Do not put an admin password in Firestore. Passwords belong only to Firebase Authentication.

The website checks `users/{Firebase Auth UID}` and accepts `admin` or `pastor` roles.

## B. Deploy the project

Run from the folder containing `firebase.json`:

```bash
firebase login
firebase use healing-tabernacle-centre-nabw
firebase deploy --only firestore:rules,storage,functions,hosting
```

If Firebase CLI asks for a project, choose `healing-tabernacle-centre-nabw`.

## C. Test admin login

1. Open `/admin-login.html`.
2. Sign in with the Authentication email/password.
3. Confirm the page reaches `/admin.html`.
4. Confirm the header says `Administrator: ...`.
5. Open Secure Messages & Ministry Records.
6. Re-enter the same Firebase password.
7. Confirm the secure records load.
8. Test Logout and confirm it returns to Admin Login.

If Access Denied appears, check the exact UID and `role` field in `users` first.

## D. Test Contact Us

1. Open `/contact.html` on the deployed HTTPS site.
2. Enter a real test name, email and message.
3. Press **Send Message** once.
4. Confirm the success message appears.
5. In Firestore, confirm a new document appears in `contactMessages` with:
   - `status: new`
   - `source: website-contact-form`
   - `createdAt`
   - `updatedAt`
6. Open Secure Messages & Ministry Records and confirm the message is visible.
7. Confirm a corresponding unread notification is created if the deployed Cloud Function `notifyContact` is active.

## E. Final production smoke test

Test these pages on both Android Chrome and desktop:

- `/`
- `/about.html`
- `/branches.html`
- `/branch.html`
- `/ministries.html`
- `/events.html`
- `/sermons.html`
- `/livestream.html`
- `/bible.html`
- `/contact.html`
- `/register.html`
- `/login.html`
- `/dashboard.html`
- `/admin-login.html`
- `/admin.html`
- `/admin-platform.html`
- `/admin-secure.html`
- `/admin-settings.html`
- `/admin-updates.html`

Check every form for: validation, success message, Firestore record creation, and mobile layout.

## F. Important production configuration still requiring real church values

- Church phone/email/WhatsApp
- Official social media links
- Official livestream URL
- Real branch contacts/locations
- Approved giving/payment details
- Any external email/SMS/push provider credentials

Never put Firebase service-account private keys in the website files.
