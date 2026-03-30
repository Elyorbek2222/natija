/* ── assistant.js — Dashboard AI Assistant ───────────────────────
   Primary: Claude AI via /api/chat (Vercel serverless)
   Fallback: Rule-based analyst (no API needed)
   Format: FAKT → XULOSA → HARAKAT. Only USD ($). No rubles.
──────────────────────────────────────────────────────────────── */
const Assistant = (() => {

  let _data    = null;
  let _history = []; // conversation history for AI context

  function onDataLoad(data) {
    _data    = data;
    _history = []; // reset history when new data loads
  }

  // ── QUICK QUESTIONS ─────────────────────────────────────────
  const QUICK = [
    { i18n: "ast.q1", key: "cut"       },
    { i18n: "ast.q2", key: "best"      },
    { i18n: "ast.q3", key: "funnel"    },
    { i18n: "ast.q4", key: "budget"    },
    { i18n: "ast.q5", key: "questions" },
    { i18n: "ast.q6", key: "summary"   },
  ];

  // ── MAIN ENTRY POINT (async) ────────────────────────────────
  async function answer(input) {
    if (!_data) {
      return _format(
        "Ma'lumot yuklanmagan",
        "Dashboard data hali yuklanmagan.",
        "Excel faylni yuklang yoki sahifani yangilang."
      );
    }

    const camps = _data.campaigns || [];
    if (!camps.length) {
      return _format("Kampaniya yo'q", "Yuklangan faylda kampaniya topilmadi.", "Boshqa Excel faylni yuklashga harakat qiling.");
    }

    // Try AI first
    const aiResponse = await _answerAI(input);
    if (aiResponse) return aiResponse;

    // Fallback to rule-based
    return _answerRuleBased(input, camps);
  }

  // ── AI MODE ─────────────────────────────────────────────────
  async function _answerAI(question) {
    try {
      const dataContext = _buildDataContext(_data);
      const lang        = window.I18n ? I18n.getLang() : 'uz';

      const resp = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          dataContext,
          lang,
          history: _history,
        }),
      });

      // Not deployed or 404 → silently fall back
      if (!resp.ok) {
        if (resp.status === 404 || resp.status === 503) return null;
        return null;
      }

      const data = await resp.json();
      if (!data.text) return null;

      // Save to conversation history
      _history.push({ role: 'user',      content: question   });
      _history.push({ role: 'assistant', content: data.text  });
      if (_history.length > 20) _history = _history.slice(-20);

      return _md2html(data.text);
    } catch (_e) {
      return null; // network error → fall back
    }
  }

  // ── BUILD DATA CONTEXT (compact text for system prompt) ────
  function _buildDataContext(data) {
    if (!data) return '';
    const { meta = {}, campaigns = [], totals = {} } = data;

    const platform   = meta.platform || meta.sourceFile || 'Unknown';
    const period     = meta.period_start
      ? `${meta.period_start} – ${meta.period_end}`
      : (meta.period || '—');

    const totalSpend = totals.spent_usd   || campaigns.reduce((s,c) => s+(c.metrics?.spent_usd||0),    0);
    const totalRes   = totals.results     || campaigns.reduce((s,c) => s+(c.metrics?.results||0),      0);
    const totalImpr  = totals.impressions || campaigns.reduce((s,c) => s+(c.metrics?.impressions||0),  0);
    const totalReach =                       campaigns.reduce((s,c) => s+(c.metrics?.reach||0),        0);
    const avgCpl     = totalRes > 0 ? totalSpend / totalRes : 0;

    let ctx = `Platform: ${platform} | Period: ${period}\n`;
    ctx += `Totals: $${totalSpend.toFixed(2)} spend | ${totalRes} results | Avg CPL $${avgCpl.toFixed(2)} | ${_fmtK(totalImpr)} impressions | ${_fmtK(totalReach)} reach\n\n`;
    ctx += `Campaigns (sorted by CPL, best first):\n`;

    const sorted = [...campaigns].sort((a,b) =>
      (a.metrics?.cost_per_result_usd || 999) - (b.metrics?.cost_per_result_usd || 999)
    );

    sorted.forEach(c => {
      const m    = c.metrics || {};
      const name = (c.name || '').replace(/^[A-Z]{1,4}\s*\|\s*/i, '').trim().slice(0, 45);
      const rts  = (c.result_types || []).join(', ') || '—';
      ctx += `• "${name}" [${rts}]: $${(m.spent_usd||0).toFixed(2)} spent, ${m.results||0} results, CPL $${(m.cost_per_result_usd||0).toFixed(2)}, ${_fmtK(m.impressions||0)} impr, ${_fmtK(m.reach||0)} reach, CPM $${(m.cpm_usd||0).toFixed(2)}\n`;
    });

    return ctx;
  }

  // ── MARKDOWN → HTML (for AI responses) ─────────────────────
  function _md2html(text) {
    // escape HTML first, then convert markdown
    let h = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Labelled sections get colored wrapper
    h = h.replace(/\*\*(FAKT|ФАКТ):\*\*/g,       '<span class="ast-lbl ast-lbl-f">$1:</span>');
    h = h.replace(/\*\*(XULOSA|ВЫВОД):\*\*/g,    '<span class="ast-lbl ast-lbl-x">$1:</span>');
    h = h.replace(/\*\*(HARAKAT|ДЕЙСТВИЕ):\*\*/g,'<span class="ast-lbl ast-lbl-h">$1:</span>');
    h = h.replace(/\*\*(.+?)\*\*/g,              '<b>$1</b>');
    h = h.replace(/`(.+?)`/g,                    '<code>$1</code>');
    h = h.replace(/\n\n/g,                       '<br><br>');
    h = h.replace(/\n/g,                         '<br>');
    return h;
  }

  // ── RULE-BASED FALLBACK ────────────────────────────────────
  function _answerRuleBased(input, camps) {
    const q = input.toLowerCase().trim();
    if (_match(q, ["o'chir","cut","yopish","samarasiz","keraksiz","eng yomon","qaysi kanal"])) return _answerCut(camps);
    if (_match(q, ["eng yaxshi","lider","best","top kampaniya","winner"]))                     return _answerBest(camps);
    if (_match(q, ["voronka","funnel","yo'qot","teshik","konversiya","nima uchun kam"]))        return _answerFunnel(camps);
    if (_match(q, ["bujet","budget","oshir","taqsimlash","reallocat","ko'paytir"]))             return _answerBudget(camps);
    if (_match(q, ["podratchi","savol","contractor","so'ra","ask","question"]))                 return _answerQuestions(camps);
    if (_match(q, ["umumiy","summary","holat","overview","qanday","xulosa","natija"]))          return _answerSummary(camps);
    if (_match(q, ["nima bo'ldi","anomaliya","anomaly","pasaydi","o'sdi","o'zgardi"]))          return _answerAnomaly(camps);
    if (_match(q, ["cpl","narxi","qimmat","arzon"]))                                           return _answerCpl(camps);
    if (_match(q, ["cpm","impressions","reach","ko'rsatish"]))                                 return _answerTraffic(camps);
    return _answerFallback(q, camps);
  }

  // ── INTENT HANDLERS ─────────────────────────────────────────

  function _answerCut(camps) {
    const sorted = [...camps].filter(c => c.metrics?.results > 0)
      .sort((a,b) => (b.metrics.cost_per_result_usd||0) - (a.metrics.cost_per_result_usd||0));
    const worst = sorted[0];
    const best  = sorted[sorted.length - 1];
    if (!worst) return _noData();

    const wCpl  = worst.metrics.cost_per_result_usd;
    const bCpl  = best.metrics.cost_per_result_usd;
    const ratio = wCpl > 0 && bCpl > 0 ? (wCpl / bCpl).toFixed(1) : "—";
    const freed = worst.metrics.spent_usd?.toFixed(2) || "?";

    return _format(
      `Eng yomon CPL: <b>${_sn(worst.name)}</b> — $${_f(wCpl)} (liderdan ${ratio}x qimmat)`,
      `Bu kampaniya $${freed} sarfladi, faqat ${worst.metrics.results} ta natija berdi. Bujet samarasiz ketmoqda.`,
      `"${_sn(worst.name)}" ni to'xtatib, $${freed} ni <b>${_sn(best.name)}</b> ($${_f(bCpl)} CPL) ga yo'ldiring.`
    ) + _table(sorted.slice(0,5), ["Kampaniya","CPL","Xarajat","Natija"], c => [
      _sn(c.name), "$"+_f(c.metrics.cost_per_result_usd), "$"+_f(c.metrics.spent_usd), c.metrics.results
    ]);
  }

  function _answerBest(camps) {
    const sorted = [...camps].filter(c => c.metrics?.results > 0)
      .sort((a,b) => (a.metrics.cost_per_result_usd||999) - (b.metrics.cost_per_result_usd||999));
    const best = sorted[0];
    if (!best) return _noData();

    const totResults  = camps.reduce((s,c) => s+(c.metrics?.results||0), 0);
    const share       = totResults > 0 ? ((best.metrics.results/totResults)*100).toFixed(1) : 0;
    const totSpend    = camps.reduce((s,c) => s+(c.metrics?.spent_usd||0), 0);
    const spendShare  = totSpend > 0 ? ((best.metrics.spent_usd/totSpend)*100).toFixed(1) : 0;

    return _format(
      `Lider: <b>${_sn(best.name)}</b> — CPL $${_f(best.metrics.cost_per_result_usd)}`,
      `Barcha natijalarning ${share}%ini berdi, bujetning faqat ${spendShare}%ini ishlatib. Eng samarali kampaniya.`,
      `Ushbu kampaniya bujetini 20–30% oshiring. Audience va kreativlarni boshqa kampaniyalarga ko'chiring.`
    );
  }

  function _answerFunnel(camps) {
    const totImpr  = camps.reduce((s,c) => s+(c.metrics?.impressions||0), 0);
    const totReach = camps.reduce((s,c) => s+(c.metrics?.reach||0),       0);
    const totRes   = camps.reduce((s,c) => s+(c.metrics?.results||0),     0);

    const impToReach = totImpr  > 0 ? (totReach/totImpr*100).toFixed(1)  : 0;
    const reachToRes = totReach > 0 ? (totRes/totReach*100).toFixed(2)   : 0;

    const bottleneck = parseFloat(reachToRes) < 0.5
      ? "Reach → Natija o'tishida katta yo'qotish — kreativ yoki landing sahifa muammo"
      : parseFloat(impToReach) < 70
      ? "Impressions → Reach o'tishida yo'qotish — auditoriya takrorlanishi yoki chastota muammo"
      : "Voronka yaxshi ishlayapti — optimizatsiyaga joy bor";

    return _format(
      `${_fmtK(totImpr)} ko'rsatish → ${_fmtK(totReach)} reach (${impToReach}%) → ${totRes} natija (${reachToRes}% reach→natija)`,
      `${bottleneck}.`,
      `CTA matnini A/B test qiling. Podratchi: "Oxirgi marta kreativni qachon o'zgartirdingiz?"`
    );
  }

  function _answerBudget(camps) {
    const totSpend = camps.reduce((s,c) => s+(c.metrics?.spent_usd||0), 0);
    const totRes   = camps.reduce((s,c) => s+(c.metrics?.results||0),   0);
    const avgCpl   = totRes > 0 ? totSpend/totRes : 0;

    const sorted = [...camps].filter(c => c.metrics?.results > 0)
      .sort((a,b) => (a.metrics.cost_per_result_usd||999) - (b.metrics.cost_per_result_usd||999));
    const best  = sorted[0];
    const worst = sorted[sorted.length - 1];

    const extra20  = (totSpend * 0.2).toFixed(2);
    const extraRes = avgCpl > 0 && best ? Math.round(totSpend * 0.2 / best.metrics.cost_per_result_usd) : 0;

    return _format(
      `Joriy bujet: $${_f(totSpend)} · O'rtacha CPL: $${_f(avgCpl)} · ${totRes} ta natija`,
      `Agar $${extra20} qo'shilsa va barchasi ${_sn(best?.name)} ga yo'naltirilsa (~${extraRes} ta qo'shimcha natija kutiladi).`,
      `"${_sn(worst?.name)}" bujetini to'xtatib, "${_sn(best?.name)}" ga qo'shing — hoziroq amalga oshirsa bo'ladi.`
    ) + _table(sorted, ["Kampaniya","CPL","Bujet ulushi","Natija ulushi"], c => {
      const sp = c.metrics.spent_usd || 0;
      const rs = c.metrics.results   || 0;
      return [
        _sn(c.name),
        "$"+_f(c.metrics.cost_per_result_usd),
        totSpend>0 ? (sp/totSpend*100).toFixed(1)+"%" : "—",
        totRes>0   ? (rs/totRes*100).toFixed(1)+"%" : "—",
      ];
    });
  }

  function _answerQuestions(camps) {
    const sorted  = [...camps].sort((a,b) => (b.metrics?.cost_per_result_usd||0)-(a.metrics?.cost_per_result_usd||0));
    const worst   = sorted[0];
    const totImpr = camps.reduce((s,c) => s+(c.metrics?.impressions||0), 0);
    const totRes  = camps.reduce((s,c) => s+(c.metrics?.results||0),     0);
    const cr      = totImpr > 0 ? (totRes/totImpr*100).toFixed(3) : "?";

    const qs = [
      `"${_sn(worst?.name)}" kampaniyasi CPL $${_f(worst?.metrics?.cost_per_result_usd)} — boshqalardan nima farq qiladi?"`,
      `"${_fmtK(totImpr)} ko'rsatishdan faqat ${totRes} natija (${cr}%). CTA yoki landing A/B test qildingizmi?"`,
      `"Eng yaxshi kampaniya audience'ini boshqalarga lookalike qilib test qildingizmi?"`,
      `"CPM $${_f(camps.reduce((s,c)=>s+(c.metrics?.cpm_usd||0),0)/camps.length)} o'rtacha — bid strategiyani ko'rib chiqdingizmi?"`,
      `"Keyingi 2 haftada qaysi kampaniyalarni to'xtatish, qaysilarini kengaytirish rejalashtirilgan?"`,
    ];

    let html = `<div class="ast-fakt"><b>FAKT:</b> ${camps.length} ta kampaniya, ${totRes} natija, $${_f(camps.reduce((s,c)=>s+(c.metrics?.spent_usd||0),0))} sarflandi</div>`;
    html += `<div class="ast-xulosa"><b>XULOSA:</b> Quyidagi savollarni podratchiga bering — raqamlarga asoslangan.</div>`;
    html += `<div class="ast-harakat"><b>SAVOLLAR:</b><ol class="ast-ol">`;
    qs.forEach(q => { html += `<li>${q}</li>`; });
    html += `</ol></div>`;
    return html;
  }

  function _answerSummary(camps) {
    const totSpend = camps.reduce((s,c) => s+(c.metrics?.spent_usd||0),     0);
    const totRes   = camps.reduce((s,c) => s+(c.metrics?.results||0),       0);
    const totImpr  = camps.reduce((s,c) => s+(c.metrics?.impressions||0),   0);
    const totReach = camps.reduce((s,c) => s+(c.metrics?.reach||0),         0);
    const avgCpl   = totRes > 0 ? totSpend/totRes : 0;
    const sorted   = [...camps].filter(c=>c.metrics?.results>0).sort((a,b)=>a.metrics.cost_per_result_usd-b.metrics.cost_per_result_usd);
    const best     = sorted[0];
    const worst    = sorted[sorted.length-1];
    const meta     = _data.meta || {};
    const period   = meta.period_start ? `${meta.period_start} — ${meta.period_end}` : "—";

    return _format(
      `${period} · ${camps.length} kampaniya · $${_f(totSpend)} sarflandi · ${totRes} natija · Avg CPL $${_f(avgCpl)}`,
      `Lider: ${_sn(best?.name)} ($${_f(best?.metrics?.cost_per_result_usd)} CPL). Autsayder: ${_sn(worst?.name)} ($${_f(worst?.metrics?.cost_per_result_usd)} CPL). Farq: ${worst&&best&&best.metrics.cost_per_result_usd>0?(worst.metrics.cost_per_result_usd/best.metrics.cost_per_result_usd).toFixed(1):"-"}x.`,
      `Autsayderni to'xtating, bujetni liderga o'tkazing — bugun amalga oshirsa bo'ladi.`
    );
  }

  function _answerAnomaly(camps) {
    const cpls       = camps.filter(c=>c.metrics?.results>0).map(c=>c.metrics.cost_per_result_usd);
    const avg        = cpls.reduce((a,b)=>a+b,0)/cpls.length;
    const anomalies  = camps.filter(c => c.metrics?.cost_per_result_usd > avg*2 && c.metrics?.results > 0);

    if (!anomalies.length) {
      return _format(
        "Katta anomaliya topilmadi",
        "Kampaniyalar CPL ko'rsatkichi o'rtacha darajadan 2x oshib ketmagan.",
        "Dinamikani kuzatishni davom eting. Haftalik CPL o'zgarishini so'rang."
      );
    }

    const a = anomalies[0];
    return _format(
      `Anomaliya: <b>${_sn(a.name)}</b> — CPL $${_f(a.metrics.cost_per_result_usd)} (o'rtachadan ${(a.metrics.cost_per_result_usd/avg).toFixed(1)}x yuqori)`,
      `Bu kampaniyada bid, audience yoki kreativ muammo bo'lishi mumkin.`,
      `Podratchiga: "Bu kampaniyada nima o'zgardi? Nima uchun CPL $${_f(avg)} o'rtachadan shu qadar baland?"`
    );
  }

  function _answerCpl(camps) {
    const sorted = [...camps].filter(c=>c.metrics?.results>0)
      .sort((a,b)=>a.metrics.cost_per_result_usd-b.metrics.cost_per_result_usd);
    if (!sorted.length) return _noData();
    return _format(
      `CPL diapazoni: $${_f(sorted[0]?.metrics.cost_per_result_usd)} (eng arzon) — $${_f(sorted[sorted.length-1]?.metrics.cost_per_result_usd)} (eng qimmat)`,
      `${sorted.length} ta kampaniya orasida CPL ${(sorted[sorted.length-1]?.metrics.cost_per_result_usd/sorted[0]?.metrics.cost_per_result_usd).toFixed(1)}x farq qiladi.`,
      `Eng qimmat kampaniyani to'xtating. Eng arzon kampaniya audience'ini boshqalarga ko'chiring.`
    ) + _table(sorted, ["Kampaniya","CPL","Natijalar"], c=>[
      _sn(c.name), "$"+_f(c.metrics.cost_per_result_usd), c.metrics.results
    ]);
  }

  function _answerTraffic(camps) {
    const totImpr   = camps.reduce((s,c)=>s+(c.metrics?.impressions||0),0);
    const totReach  = camps.reduce((s,c)=>s+(c.metrics?.reach||0),0);
    const avgCpm    = camps.reduce((s,c)=>s+(c.metrics?.cpm_usd||0),0)/camps.length;
    const topImpr   = [...camps].sort((a,b)=>(b.metrics?.impressions||0)-(a.metrics?.impressions||0))[0];

    return _format(
      `Jami: ${_fmtK(totImpr)} impressions · ${_fmtK(totReach)} reach · Avg CPM $${_f(avgCpm)}`,
      `Eng ko'p trafik: ${_sn(topImpr?.name)} — ${_fmtK(topImpr?.metrics?.impressions)} ko'rsatish, CPM $${_f(topImpr?.metrics?.cpm_usd)}.`,
      `CPM past kampaniyalar keng auditoriyaga arzon yetadi. Ularni trafik maqsadida kengaytiring.`
    );
  }

  function _answerFallback(q, camps) {
    const totSpend = camps.reduce((s,c)=>s+(c.metrics?.spent_usd||0),0);
    const totRes   = camps.reduce((s,c)=>s+(c.metrics?.results||0),0);
    return _format(
      `Savol: "${q}" — ${camps.length} ta kampaniya, $${_f(totSpend)}, ${totRes} natija`,
      "Aniqroq javob uchun yuqoridagi tezkor savollardan birini tanlang.",
      "\"Qaysi kanal o'chirilsin?\", \"Voronkadagi muammo?\", \"Podratchi uchun savollar\""
    );
  }

  // ── HELPERS ─────────────────────────────────────────────────

  function _format(fakt, xulosa, harakat) {
    return `<div class="ast-fakt"><b>FAKT:</b> ${fakt}</div>
<div class="ast-xulosa"><b>XULOSA:</b> ${xulosa}</div>
<div class="ast-harakat"><b>HARAKAT:</b> ${harakat}</div>`;
  }

  function _table(rows, headers, rowFn) {
    if (!rows.length) return "";
    const h = headers.map(h=>`<th>${h}</th>`).join("");
    const b = rows.map(r=>`<tr>${rowFn(r).map(c=>`<td>${c}</td>`).join("")}</tr>`).join("");
    return `<table class="ast-tbl"><thead><tr>${h}</tr></thead><tbody>${b}</tbody></table>`;
  }

  function _match(q, keywords) { return keywords.some(k => q.includes(k)); }
  function _sn(name)  { return (name||"").replace(/^[A-Z]{1,4}\s*\|\s*/i,"").trim().slice(0,28); }
  function _f(n)      { return (+n||0).toFixed(2); }
  function _fmtK(n)   { return n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?(n/1000).toFixed(0)+"K":String(n||0); }
  function _noData()  { return _format("Ma'lumot yetarli emas","Bu metrika uchun yetarli kampaniya yo'q.","Excel faylni qayta yuklang."); }

  return { answer, onDataLoad, QUICK };
})();

window.Assistant = Assistant;
