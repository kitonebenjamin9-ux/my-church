# Firebase Contact + Admin Access Fix

This build fixes two client-side issues:

1. The admin dashboard now accepts the same authorized roles consistently (`admin` and `pastor`, including common capitalization variants).
2. The secure-records page had a JavaScript initialization-order bug that could fail before the password screen loaded. That bug is fixed.
3. The Contact Us form writes to `contactMessages` and includes a Firebase REST fallback if the browser SDK submission fails. The Firestore Security Rules still control access.
4. Contact submissions show a delivery reference after Firestore accepts the message.

## IMPORTANT: deploy the Firebase rules and hosting files

A ZIP cannot change rules already deployed in the Firebase project. From the website root, run:

```bash
firebase login
firebase use healing-tabernacle-centre-nabw
firebase deploy --only firestore:rules,storage,functions,hosting
```

After deployment, test the Contact Us form and then open:

`Admin Dashboard -> Secure Messages & Records -> enter the current Firebase admin password -> Contact Messages`

If the contact form reports `permission-denied`, the deployed Firebase rules are not the rules included in this ZIP yet (or the project ID is different). Check that the Firebase project is `healing-tabernacle-centre-nabw`.
