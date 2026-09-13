# Healing Tabernacle Media Folder

This folder is for media you publish through the church website.

## Audio
Put audio files in `media/audio/`.
Recommended names:
- `sunday-sermon-2026-09-13.mp3`
- `bible-study-john-3.mp3`
- `daily-devotion-2026-09-13.mp3`

## PDFs
Put PDF files in `media/pdfs/`.
Recommended names:
- `weekly-bible-study.pdf`
- `sermon-notes-faith.pdf`
- `church-announcement.pdf`

## How to publish
Use **Admin Dashboard → Media Library** to upload an audio or PDF file. The admin page stores the file in Firebase Storage and creates a `mediaLibrary` Firestore record so the website can display it.

The example files in this package are safe placeholders showing the correct folder and naming structure. Replace them with your real media.
