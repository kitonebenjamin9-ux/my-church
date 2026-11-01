# Final Repair + Test Report

## Admin authorization
- Normalizes role with trim + lowercase.
- Accepts `admin` and `pastor` consistently.
- Secure records now accepts both admin and pastor.
- Added cache-busting query parameters to admin module scripts so stale browser modules are not reused.
- Dashboard displays the detected role after successful verification.

## Contact form
- `contact.html` loads `js/contact-form.js`.
- Form writes to `contactMessages` with status `new`, timestamps, and source.
- Firestore rules allow public creation only when status is `new`.
- Admin reads/updates/deletes require admin role.

## Static verification
- All HTML files were retained from the supplied package.
- Firebase config points to project `healing-tabernacle-centre-nabw`.
- No Firebase passwords/private keys were added.

## Required live Firebase action
The live project must have:
`users/<Firebase Authentication UID>` with `role` set to `admin` or `pastor`.

Deploy with Firebase CLI from the website project folder:
`firebase use healing-tabernacle-centre-nabw`
`firebase deploy --only firestore:rules,storage,functions,hosting`
