// ─────────────────────────────────────────────────────────────
//  driveUpload.js — n8n orqali Google Drive ga fayl yuklash
//
//  Setup:
//  1. n8n da "Drive Upload" workflow yarating (Webhook trigger)
//  2. N8N_DRIVE_WEBHOOK_URL ni shu yerga kiriting
//  3. Google service account ni n8n credentials ga qo'shing
//  4. Drive papkasini service account bilan share qiling
// ─────────────────────────────────────────────────────────────

// n8n Webhook URL — workflow yaratgandan keyin to'ldiring
const N8N_DRIVE_WEBHOOK_URL = "YOUR_N8N_WEBHOOK_URL"; // https://your-n8n.domain/webhook/drive-upload

// ── FAYLNI DRIVE GA YUKLASH ────────────────────────────────────
// file: File object (original .xlsx)
// uid: Firebase user UID (Drive papka tuzilishi uchun)
// returns: { success, fileId, driveLink } yoki { success: false, error }
export async function uploadToDrive(file, uid) {
  if (!N8N_DRIVE_WEBHOOK_URL || N8N_DRIVE_WEBHOOK_URL.startsWith("YOUR_")) {
    console.warn("driveUpload: N8N_DRIVE_WEBHOOK_URL sozlanmagan, o'tkazib yuborildi");
    return { success: false, error: "webhook_not_configured" };
  }

  try {
    const formData = new FormData();
    formData.append("file",     file);
    formData.append("uid",      uid);
    formData.append("filename", file.name);

    const res = await fetch(N8N_DRIVE_WEBHOOK_URL, {
      method: "POST",
      body:   formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`n8n webhook xatosi (${res.status}): ${text.slice(0, 120)}`);
    }

    const data = await res.json();
    return { success: true, fileId: data.fileId, driveLink: data.webViewLink || data.driveLink };

  } catch (e) {
    console.error("Drive upload xatosi:", e);
    return { success: false, error: e.message };
  }
}
