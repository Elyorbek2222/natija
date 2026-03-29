// ─────────────────────────────────────────────────────────────
//  auth.js — Google OAuth login / logout
//  Firebase Authentication модули
// ─────────────────────────────────────────────────────────────

import { initializeApp }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase ni ishga tushirish
const app  = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Boshqa modullar uchun eksport
window.__firebaseApp  = app;
window.__firebaseAuth = auth;

// ── LOGIN ──────────────────────────────────────────────────────
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error("Login xatosi:", err.message);
    throw err;
  }
}

// ── LOGOUT ─────────────────────────────────────────────────────
export async function logout() {
  await signOut(auth);
  window.location.href = "index.html";
}

// ── AUTH HOLATI KUZATISH ────────────────────────────────────────
// callback(user) — user = null bo'lsa login yo'q
export function watchAuth(callback) {
  onAuthStateChanged(auth, callback);
}

// ── JORIY FOYDALANUVCHI ─────────────────────────────────────────
export function currentUser() {
  return auth.currentUser;
}
