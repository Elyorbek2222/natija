// ─────────────────────────────────────────────────────────────
//  access.js — To'lov va admin tekshiruvi
//  Barcha himoyalangan sahifalar bu modulni ishlatadi
// ─────────────────────────────────────────────────────────────

import { getFirestore, doc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function getDB() {
  return getFirestore(window.__firebaseApp);
}

// ── TO'LOV TEKSHIRUVI ─────────────────────────────────────────
// Qaytaradi: { allowed: true, plan } yoki { allowed: false, reason }
export async function checkAccess(uid) {
  try {
    const snap = await getDoc(doc(getDB(), "users", uid));
    if (!snap.exists()) return { allowed: false, reason: "no_user" };

    const d = snap.data();

    // isPaid tekshir
    if (!d.isPaid) return { allowed: false, reason: "not_paid" };

    // Muddati o'tganmi?
    if (d.paidUntil) {
      const expiry = d.paidUntil.toDate ? d.paidUntil.toDate() : new Date(d.paidUntil);
      if (expiry < new Date()) return { allowed: false, reason: "expired" };
    }

    return { allowed: true, plan: d.plan || "active" };
  } catch (e) {
    console.error("checkAccess error:", e);
    return { allowed: false, reason: "error" };
  }
}

// ── ADMIN TEKSHIRUVI ──────────────────────────────────────────
export async function isAdmin(uid) {
  try {
    const snap = await getDoc(doc(getDB(), "users", uid));
    return snap.exists() && snap.data().isAdmin === true;
  } catch {
    return false;
  }
}

// ── SAHIFA HIMOYASI (redirect bilan) ─────────────────────────
// dashboard.html va upload.html da onAuthStateChanged ichida chaqiriladi
export async function requireAccess(uid) {
  const access = await checkAccess(uid);
  if (!access.allowed) {
    window.location.href = "paywall.html";
    return false;
  }
  return true;
}

// ── ADMIN SAHIFA HIMOYASI ─────────────────────────────────────
export async function requireAdmin(uid) {
  const admin = await isAdmin(uid);
  if (!admin) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}
