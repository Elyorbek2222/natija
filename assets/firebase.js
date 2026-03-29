// Firebase Web SDK config
// NOTE: Firebase API keys for web apps are PUBLIC identifiers by design.
// Security is enforced via Firestore Security Rules (firestore.rules)
// and authorized domains in Firebase Console → Authentication → Settings.
//
// AFTER DEPLOY: Add your domain to Firebase Console →
//   Authentication → Settings → Authorized domains

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAy_vgf9QqB02ZGwKySFafh9_1ExOOubyg",
  authDomain:        "marketing-dashboard-c11e0.firebaseapp.com",
  projectId:         "marketing-dashboard-c11e0",
  storageBucket:     "marketing-dashboard-c11e0.firebasestorage.app",
  messagingSenderId: "448225227151",
  appId:             "1:448225227151:web:aabaed9ba58333959adbfa",
  measurementId:     "G-52LYR9TPJ8"
};

window.FIREBASE_CONFIG = FIREBASE_CONFIG;
