# Groupify 🎲
### Smart Student Group Shuffler — React + Vite + Tailwind + Firebase

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com) and create a project
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** (start in test mode, then apply security rules)
4. Enable **Storage** (for background images)
5. Copy your Firebase config

### 3. Set up environment variables
```bash
cp .env.example .env
```
Fill in your Firebase credentials in `.env`

### 4. Run development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```

---

## Firebase Security Rules

Apply these in the Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /portals/{portalId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.ownerId;
      match /students/{studentId} {
        allow create: if get(/databases/$(database)/documents/portals/$(portalId)).data.isOpen == true;
        allow read: if request.auth.uid == get(/databases/$(database)/documents/portals/$(portalId)).data.ownerId;
      }
    }
  }
}
```

Firebase Storage Rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portals/{portalId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Project Structure

```
src/
├── components/
│   ├── AppLayout.jsx      ← Sidebar + main layout
│   ├── Modal.jsx          ← Reusable modal
│   ├── PortalBadge.jsx    ← Open/Closed status badge
│   ├── Toast.jsx          ← Notification toasts
│   └── Toggle.jsx         ← Toggle switch
├── contexts/
│   └── AuthContext.jsx    ← Firebase auth state
├── pages/
│   ├── Landing.jsx        ← Marketing landing page
│   ├── Login.jsx          ← Sign in / Sign up
│   ├── Dashboard.jsx      ← Admin dashboard
│   ├── Portals.jsx        ← Manage portals
│   ├── Students.jsx       ← View registered students
│   ├── Groups.jsx         ← Shuffled group view + export
│   ├── PortalSettings.jsx ← Portal configuration
│   ├── Appearance.jsx     ← Background image + colors
│   ├── Questions.jsx      ← Custom survey questions
│   └── PortalView.jsx     ← Student-facing registration
├── utils/
│   ├── shuffle.js         ← Fisher-Yates shuffle algorithm
│   ├── exportExcel.js     ← Excel export (xlsx library)
│   ├── portalService.js   ← All Firestore/Storage operations
│   └── nanoid.js          ← Unique ID generator
├── firebase.js            ← Firebase initialization
├── App.jsx                ← Router + route protection
├── main.jsx               ← Entry point
└── index.css              ← Tailwind + custom styles
```

---

## Features

- ✅ Admin authentication (Firebase Auth)
- ✅ Create multiple portals per account
- ✅ Custom group size configuration
- ✅ Custom survey questions (multiple choice)
- ✅ Background image upload (Firebase Storage)
- ✅ Custom accent colors per portal
- ✅ Open/close portal from dashboard
- ✅ Real-time student registration feed
- ✅ Fisher-Yates random shuffle algorithm
- ✅ Excel export with 3 sheets (All Students, By Group, Summary)
- ✅ Student-facing portal with clean form UI
- ✅ Responsive design (mobile + desktop)

---

## Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # set build/ as public dir, SPA mode: yes
npm run build
firebase deploy
```
