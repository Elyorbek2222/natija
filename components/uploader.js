// ─────────────────────────────────────────────────────────────
//  uploader.js — Excel faylni parse qilish
//  Meta Ads otchot formatini kampaniyalarga aylantiradi
//  SheetJS (xlsx.js) kutubxonasini ishlatadi
// ─────────────────────────────────────────────────────────────

// ── META ADS USTUN NOMLARI (turli tillarda) ───────────────────
const COL_MAP = {
  // Kampaniya nomi
  campaign: [
    "Campaign name", "Название кампании", "Kampaniya nomi",
    "campaign_name", "Кампания"
  ],
  // Sarflangan pul
  spend: [
    "Amount spent (USD)", "Потрачено (USD)", "Сумма расходов (USD)",
    "Amount spent", "Spend", "spend", "Расход"
  ],
  // Natijalar soni
  results: [
    "Results", "Результаты", "Natijalar", "result"
  ],
  // Natija turi
  result_type: [
    "Result Type", "Тип результата", "Natija turi"
  ],
  // Impressions
  impressions: [
    "Impressions", "Показы", "impressions"
  ],
  // Reach
  reach: [
    "Reach", "Охват", "reach"
  ],
  // CPM
  cpm: [
    "CPM (cost per 1,000 impressions) (USD)", "CPM (USD)", "CPM",
    "Цена за 1000 показов (USD)"
  ],
  // CPR (Cost per result)
  cpr: [
    "Cost per result (USD)", "Цена за результат (USD)", "CPR (USD)",
    "Cost per result"
  ]
};

// ── USTUN NOMINI TOPISH ────────────────────────────────────────
function findCol(headers, aliases) {
  for (const alias of aliases) {
    const found = headers.find(h =>
      h && h.toString().toLowerCase().trim() === alias.toLowerCase().trim()
    );
    if (found) return found;
  }
  // Qisman moslik
  for (const alias of aliases) {
    const found = headers.find(h =>
      h && h.toString().toLowerCase().includes(alias.toLowerCase().split(' ')[0])
    );
    if (found) return found;
  }
  return null;
}

// ── EXCEL → KAMPANIYALAR ───────────────────────────────────────
export function parseMetaAdsExcel(arrayBuffer) {
  const XLSX = window.XLSX;
  if (!XLSX) throw new Error("SheetJS yuklanmagan");

  const wb   = XLSX.read(arrayBuffer, { type: "array" });
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  if (!rows.length) throw new Error("Excel fayl bo'sh");

  const headers = Object.keys(rows[0]);

  // Ustun nomlarini topamiz
  const cols = {
    campaign:    findCol(headers, COL_MAP.campaign),
    spend:       findCol(headers, COL_MAP.spend),
    results:     findCol(headers, COL_MAP.results),
    result_type: findCol(headers, COL_MAP.result_type),
    impressions: findCol(headers, COL_MAP.impressions),
    reach:       findCol(headers, COL_MAP.reach),
    cpm:         findCol(headers, COL_MAP.cpm),
    cpr:         findCol(headers, COL_MAP.cpr),
  };

  if (!cols.campaign) throw new Error("Kampaniya nomi ustuni topilmadi. Meta Ads otchotini yuklang.");
  if (!cols.spend)    throw new Error("Sarflangan pul ustuni topilmadi");

  // Kampaniyalar bo'yicha guruhlaymiz
  const grouped = {};
  for (const row of rows) {
    const name = row[cols.campaign]?.toString().trim();
    if (!name || name === "Total" || name === "Итого") continue;

    if (!grouped[name]) grouped[name] = { rows: [], result_types: new Set() };
    grouped[name].rows.push(row);
    if (cols.result_type && row[cols.result_type]) {
      grouped[name].result_types.add(row[cols.result_type].toString().trim());
    }
  }

  // Har bir kampaniya uchun metrikalarni hisoblymiz
  const campaigns = Object.entries(grouped).map(([name, data]) => {
    const sum = (col) => col
      ? data.rows.reduce((s, r) => s + (parseFloat(r[col]) || 0), 0)
      : 0;

    const avg = (col) => col && data.rows.length
      ? sum(col) / data.rows.length
      : 0;

    const spent      = parseFloat(sum(cols.spend).toFixed(2));
    const results    = Math.round(sum(cols.results));
    const impressions = Math.round(sum(cols.impressions));
    const reach      = Math.round(sum(cols.reach));
    const cpr        = cols.cpr
      ? parseFloat(avg(cols.cpr).toFixed(2))
      : results > 0 ? parseFloat((spent / results).toFixed(2)) : 0;
    const cpm        = cols.cpm
      ? parseFloat(avg(cols.cpm).toFixed(2))
      : impressions > 0 ? parseFloat((spent / impressions * 1000).toFixed(2)) : 0;

    // Qisqa nom (ZF | Antaliya SMS → Antaliya SMS)
    const short = name.replace(/^[A-Z]{1,4}\s*\|\s*/i, "").trim().slice(0, 22);

    return {
      name,
      short,
      result_types: Array.from(data.result_types),
      metrics: {
        spent_usd:             spent,
        results,
        cost_per_result_usd:   cpr,
        impressions,
        reach,
        cpm_usd:               cpm,
      },
      structure: {
        ads_count:   data.rows.length,
        active_days: data.rows.length
      }
    };
  });

  if (!campaigns.length) throw new Error("Kampaniyalar topilmadi");

  // Totals
  const totals = {
    spent_usd:             parseFloat(campaigns.reduce((s, c) => s + c.metrics.spent_usd, 0).toFixed(2)),
    results:               campaigns.reduce((s, c) => s + c.metrics.results, 0),
    impressions:           campaigns.reduce((s, c) => s + c.metrics.impressions, 0),
    avg_cost_per_result_usd: parseFloat(
      (campaigns.reduce((s, c) => s + c.metrics.spent_usd, 0) /
       Math.max(campaigns.reduce((s, c) => s + c.metrics.results, 0), 1)).toFixed(2)
    )
  };

  return {
    meta: {
      platform:     "Meta Ads",
      period_start: "",
      period_end:   "",
      uploaded:     new Date().toISOString()
    },
    campaigns,
    totals
  };
}

// ── FAYL O'QISH (ArrayBuffer) ──────────────────────────────────
export function readFileAsBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));
    reader.readAsArrayBuffer(file);
  });
}
