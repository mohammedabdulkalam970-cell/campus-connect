# Campus Connect NECN

A modern, full-stack college community platform for **Narayana Engineering College, Nellore (NECN)**.

## Features

- 🔐 Firebase Authentication (Email/Password)
- 📚 Notes Sharing — Upload & download PDFs, images, docs
- 📅 Events — College events with countdown timers
- 🔍 Lost & Found — Report and find lost campus items
- 💬 Real-time Chat — DM & department group chat
- 👤 Profile — Editable student profiles with avatar upload
- 🛡️ Admin Panel — Manage users, events, notes
- 🌙 Dark Mode
- 📱 Fully Responsive

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Routing | React Router DOM v6 |
| Backend | Firebase (Auth, Firestore, Storage, Realtime DB) |

## Setup

### 1. Clone & Install

```bash
cd campus-connect
npm install
```

### 2. Configure Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable: **Authentication**, **Firestore**, **Storage**, **Realtime Database**
3. Copy your config into `src/firebase.js`

### 3. Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId
                   || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /notes/{noteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.uploadedBy
                    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /lostfound/{itemId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.uploadedBy
                    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /notifications/{nId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Realtime Database Rules

```json
{
  "rules": {
    "chats": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "presence": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth.uid == $uid"
      }
    }
  }
}
```

### 5. Firebase Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 20 * 1024 * 1024;
    }
  }
}
```

### 6. Run Locally

```bash
npm run dev
# Visit http://localhost:5173
```

### 7. Set Your First Admin

After creating your account, go to Firebase Console → Firestore → `users` collection → your user document → set `role: "admin"`.

## Project Structure

```
src/
├── components/      # Reusable UI components
├── context/         # AuthContext, ThemeContext
├── firebase/        # Firebase config & helpers
├── hooks/           # useFirestore, useStorage
├── layouts/         # MainLayout
├── pages/           # All page components
└── routes/          # AppRoutes with guards
```

## Deployment (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```
# campus-connect
