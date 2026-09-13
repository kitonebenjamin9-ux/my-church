# Healing Tabernacle Ministries — Firebase Church Platform

This package upgrades the supplied HTML/CSS/JavaScript website without removing the existing pages. It adds a Firebase-powered content layer, video testimony workflow, Bible reader, Christian AI assistant backend, administrator CMS, media storage rules, notifications and Firebase Hosting configuration.

## What is included

- Existing website pages/assets preserved.
- Firebase Authentication, Firestore and Storage integration.
- Dynamic collections for church settings, branches, ministries/leaders, events, sermons, announcements, daily verses, gallery, hero videos, church project, registrations, messages, prayer requests, notifications and video testimonies.
- Secure administrator role checks (`users/{uid}.role` = `admin` or `pastor`).
- Video-only public testimony submission and administrator approval workflow.
- Full 66-book Genesis → Revelation Bible reader using the public-domain KJV/AKJV source at jsonBible.org. Chapters are cached locally after first access, so previously opened Scripture remains available offline. The source states that its KJV/AKJV text is public domain and its software/data format are CC0.
- Bible reference/keyword search, chapter navigation, copy/share-friendly reader.
- HTM AI Assistant UI plus a secure Firebase Cloud Function. The AI provider key is stored as a server secret and is never placed in frontend JavaScript.
- Automatic theme colours, fixed/custom colours, light/dark mode and slow colour rotation.
- Admin CMS with collection editing, media/testimony review and dashboard statistics.
- Firebase Storage rules with file-size/type restrictions.
- Notification Cloud Functions for new prayer requests, testimonies, contacts and registrations.
- Firebase Hosting configuration.

## Important setup

### 1. Firebase project

The supplied project already contains a Firebase web configuration in `js/firebase.js`. Verify that it points to the Firebase project you intend to use.

In Firebase Console enable:
- Authentication → Email/Password
- Firestore
- Storage
- Cloud Functions
- Hosting

Publish:
- `firestore.rules`
- `storage.rules`

### 2. Create the first administrator

Create an account in Firebase Authentication. Then, from a trusted/admin environment, create its Firestore profile:

`users/USER_UID`
```json
{
  "role": "admin",
  "email": "admin@example.com"
}
```

Do not let public users write themselves an admin role. The Firestore rules prevent that.

### 3. AI Assistant

The frontend calls:
`htmAiAssistant`

The Cloud Function expects secrets:
- `AI_API_KEY`
- `AI_BASE_URL`
- `AI_MODEL`

A compatible default is:
- Base URL: `https://api.openai.com`
- Model: `gpt-5-mini`

Set the secrets with Firebase CLI before deploying the functions. Do not put the key in `js/*.js`, HTML, or Firestore.

If the AI provider is not configured, the assistant safely tells visitors that the service is not connected yet; the website does not expose an API key.

### 4. Deploy

From this `healing-tabernacle webs` directory:

```bash
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
cd functions
npm install
cd ..
firebase deploy --only firestore:rules,storage,functions,hosting
```

If the Firebase CLI is not installed, install the Firebase CLI on your development computer first.

### 5. Video testimonies

Visitors use `share-testimony.html`. They upload a video and optional photo. The submission is stored as `pending`.

Admins open `admin-platform.html` → `videoTestimonies` and approve, reject or archive submissions.

The public `testimonies.html` page displays approved videos only. There is intentionally no written-testimonial replacement system.

### 6. Dynamic content

Administrators can manage records from `admin-platform.html`.

Useful collection shapes:

`branches`
```json
{
  "name": "Mubende",
  "location": "Mubende, Uganda",
  "address": "",
  "pastor": "",
  "phone": "",
  "whatsapp": "",
  "serviceTimes": "",
  "description": "",
  "photoUrl": ""
}
```

`ministries`
```json
{
  "name": "Youth Ministry",
  "description": "",
  "leaderName": "",
  "leaderPhoto": "",
  "whatsapp": "",
  "phone": "",
  "email": "",
  "meetingTime": "",
  "location": ""
}
```

`sermons`
```json
{
  "title": "",
  "speaker": "",
  "date": "2026-08-10",
  "branch": "",
  "category": "",
  "bibleReference": "",
  "description": "",
  "audioUrl": "",
  "videoUrl": "",
  "liveStreamUrl": "",
  "youtubeUrl": "",
  "facebookLiveUrl": "",
  "downloadUrl": ""
}
```

`dailyVerses`
```json
{
  "date": "2026-08-10",
  "reference": "John 3:16",
  "text": "",
  "backgroundUrl": ""
}
```

`heroVideos`
```json
{
  "page": "index",
  "videoUrl": "",
  "fallbackImage": "",
  "active": true
}
```

`churchProject`
```json
{
  "title": "",
  "mainImage": "",
  "description": "",
  "vision": "",
  "progress": "",
  "videoUrl": "",
  "supportUrl": ""
}
```

## Bible licensing

The Bible reader uses KJV/AKJV data described by jsonBible.org as public-domain text. The website source also provides direct chapter JSON files and a JavaScript module. The reader caches accessed chapters in the browser for later offline use.

## Existing functionality

The original site pages, CSS, JavaScript, assets, authentication pages and branch folders were retained. The new platform layer is additive, so the existing static content remains as a fallback when a Firebase collection has no records.

## Recommended production hardening

Before a public launch:
1. Replace any placeholder church contact information in Firebase.
2. Create the actual admin account(s).
3. Confirm Firebase Storage quotas and video limits.
4. Configure AI provider secrets.
5. Add a privacy/consent notice for forms and uploaded videos.
6. Test Firestore/Storage rules using Firebase Emulator Suite.
7. Add the exact church branch and ministry records through the CMS.
