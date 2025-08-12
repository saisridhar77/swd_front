# Firebase Storage CORS Setup Guide

## Problem
You're getting CORS errors when trying to upload images to Firebase Storage from your frontend running on localhost.

## Solution

### 1. Install Google Cloud SDK
```bash
# For Windows (PowerShell)
# Download and install from: https://cloud.google.com/sdk/docs/install

# For Mac/Linux
curl https://sdk.cloud.google.com | bash
```

### 2. Authenticate with Google Cloud
```bash
gcloud auth login
# Sign in to your Google account that has access to the Firebase project
```

### 3. Set the Correct Project
```bash
gcloud config set project swd-store
```

### 4. Apply CORS Configuration
```bash
gsutil cors set cors.json gs://swd-store.firebasestorage.app
```

### 5. Verify CORS Setup
```bash
gsutil cors get gs://swd-store.firebasestorage.app
```

### 6. Test Upload
Restart your frontend and try uploading images again.

## Alternative: Firebase Console Method

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `swd-store`
3. Go to Storage > Rules
4. Make sure your rules allow uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

## Troubleshooting

- Make sure your Firebase config in `src/config/firebase.js` has the correct `storageBucket`
- Verify that the storage bucket name matches: `swd-store.firebasestorage.app`
- Check that your frontend is running on one of the allowed origins in `cors.json`

