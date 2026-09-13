# Healing Tabernacle Firebase connection

This package uses one Firebase project for the main site and all 46 branches.

## Services used
- Firebase Authentication: members, pastors and administrators
- Cloud Firestore: church settings, branches, events, sermons, daily verses, media records and forms
- Firebase Storage: audio, PDF and other church media
- Firebase Hosting: the whole website and branch folders
- Cloud Functions: automatic daily Bible verse synchronization and the AI endpoint

## Automatic Daily Word
`functions/index.js` contains:
- `syncDailyVerse`: scheduled for 05:15 Africa/Kampala every day
- `dailyVerse`: a public self-healing endpoint used when today's Firestore record does not exist

The function chooses a Bible passage, retrieves the KJV text from Bible API when available, and stores the result in `dailyVerses/YYYY-MM-DD`.

## Deploy
From the website root:

```bash
firebase login
firebase use healing-tabernacle-centre-nabw
firebase deploy --only firestore:rules,storage,functions,hosting
```

Scheduled Cloud Functions require a Firebase project/billing setup that supports Cloud Scheduler. If deployment reports that Scheduler or billing is required, enable the required Firebase/Google Cloud billing plan for the project.

## Media
Use **Admin Dashboard → Media Library** to upload audio and PDF files. Uploaded files go to:
- `media/audio/`
- `media/pdfs/`

The public `media-library.html` page reads the `mediaLibrary` Firestore collection.

## Bible reader appearance
The Bible page now lets visitors change:
- text size
- font family
- line spacing
- light/sepia/dark reading theme

Preferences are saved locally on the visitor's device.


## Admin-to-public synchronization
The public site now subscribes to `siteSettings/general` in real time and collection-backed sections (events, sermons, branches, ministries, leaders, gallery, testimonies, projects) use Firestore listeners. The service worker uses network-first caching for HTML/JS/CSS so stale PWA cache is less likely to hide updates.

## Secure messages and ministry records
The Admin Dashboard now has **Secure Messages & Records**. This protected area contains contact messages, prayer requests, event registrations, general registrations, members, video testimonies and the other ministry records used by the platform.

To open it, an administrator must enter the password for the currently signed-in Firebase administrator account. The site uses Firebase Authentication re-authentication; the password is not stored in Firestore, localStorage or the page source.

Website Settings, Website Updates and Media Library remain in their separate admin modules and are intentionally excluded from the secure records screen.
