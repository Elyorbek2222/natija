// ─────────────────────────────────────────────────────────────
//  dataStore.js — Firestore read / write
//  Har bir user o'zining reportlarini saqlaydi va o'qiydi
// ─────────────────────────────────────────────────────────────

import { getFirestore, doc, setDoc, getDoc, collection,
         addDoc, getDocs, query, orderBy, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase app auth.js dan keladi
let db;
function getDB() {
  if (!db) db = getFirestore(window.__firebaseApp);
  return db;
}

// ── FOYDALANUVCHI PROFILINI SAQLASH ────────────────────────────
// Login bo'lganda bir marta chaqiriladi
export async function saveUserProfile(user) {
  const ref = doc(getDB(), "users", user.uid);
  await setDoc(ref, {
    name:  user.displayName,
    email: user.email,
    photo: user.photoURL,
    lastSeen: serverTimestamp()
  }, { merge: true });
}

// ── REPORT SAQLASH ─────────────────────────────────────────────
// Excel parse qilingandan keyin chaqiriladi
// reportData = { period, campaigns: [...] }
export async function saveReport(uid, reportData) {
  const ref = collection(getDB(), "users", uid, "reports");
  const docRef = await addDoc(ref, {
    ...reportData,
    uploadedAt: serverTimestamp()
  });
  return docRef.id;
}

// ── ENG SO'NGGI REPORTNI O'QISH ────────────────────────────────
export async function getLatestReport(uid) {
  const ref = collection(getDB(), "users", uid, "reports");
  const q   = query(ref, orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

// ── BARCHA REPORTLARNI O'QISH ──────────────────────────────────
export async function getAllReports(uid) {
  const ref  = collection(getDB(), "users", uid, "reports");
  const q    = query(ref, orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── TO'LOV TEKSHIRUVI ──────────────────────────────────────────
export async function checkAccess(uid) {
  const snap = await getDoc(doc(getDB(), "users", uid));
  if (!snap.exists()) return { allowed: false, reason: "no_user" };
  const d = snap.data();
  if (!d.isPaid) return { allowed: false, reason: "not_paid" };
  if (d.paidUntil) {
    const exp = d.paidUntil.toDate ? d.paidUntil.toDate() : new Date(d.paidUntil);
    if (exp < new Date()) return { allowed: false, reason: "expired" };
  }
  return { allowed: true, plan: d.plan || "active" };
}

// ── DOSTUP BERISH (admin yoki webhook uchun) ───────────────────
export async function setUserPaid(uid, plan = "monthly") {
  const paidUntil = new Date();
  paidUntil.setMonth(paidUntil.getMonth() + (plan === "annual" ? 12 : 1));
  await setDoc(doc(getDB(), "users", uid), {
    isPaid:          true,
    plan,
    paymentProvider: "manual",
    paidAt:          serverTimestamp(),
    paidUntil
  }, { merge: true });
}

// ── DOSTUPNI BEKOR QILISH ──────────────────────────────────────
export async function revokeAccess(uid) {
  await setDoc(doc(getDB(), "users", uid), {
    isPaid:          false,
    plan:            null,
    paymentProvider: null
  }, { merge: true });
}

// ── ADMIN TEKSHIRUVI ───────────────────────────────────────────
export async function isAdmin(uid) {
  const snap = await getDoc(doc(getDB(), "users", uid));
  return snap.exists() && snap.data().isAdmin === true;
}
