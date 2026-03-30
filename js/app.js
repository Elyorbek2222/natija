/* ── app.js — KPI, filters, orchestration ───────────────────────── */
const App = (() => {
  let _reports  = [];
  let _channels = {};
  let _onDelete = null;

  // ── PUBLIC: init ─────────────────────────────────────────────
  function init(reports, onDelete) {
    _reports  = reports;
    _onDelete = onDelete;

    _buildChannels(reports);
    _buildPills(reports);

    if (!reports.length) {
      document.getElementById("emptyState").style.display  = "flex";
      document.getElementById("dashContent").style.display = "none";
      return;
    }
    _renderSummary(reports);
    _render(reports[0]);
  }

  // ── RENDER SUMMARY (2+ reports) ──────────────────────────────
  function _renderSummary(reports) {
    const block = document.getElementById("summaryBlock");
    if (!block) return;

    if (reports.length < 2) { block.style.display = "none"; return; }
    block.style.display = "block";

    // Kanallar ro'yxatini yasaymiz
    const channels = reports.map(r => {
      const cps    = r.campaigns || [];
      const spend  = cps.reduce((s,c) => s + (c.metrics?.spent_usd   || 0), 0);
      const res    = cps.reduce((s,c) => s + (c.metrics?.results      || 0), 0);
      const impr   = cps.reduce((s,c) => s + (c.metrics?.impressions  || 0), 0);
      const reach  = cps.reduce((s,c) => s + (c.metrics?.reach        || 0), 0);
      const cpl    = res > 0 ? spend / res : 0;
      const cpm    = impr > 0 ? spend / impr * 1000 : 0;
      return {
        name:  r.meta?.platform || r.sourceFile || "Kanal",
        spend, res, impr, reach, cpl, cpm,
        camps: cps.length
      };
    });

    // Umumiy KPI
    const totSpend  = channels.reduce((s,c) => s + c.spend, 0);
    const totRes    = channels.reduce((s,c) => s + c.res,   0);
    const totImpr   = channels.reduce((s,c) => s + c.impr,  0);
    const totReach  = channels.reduce((s,c) => s + c.reach, 0);
    const avgCpl    = totRes > 0 ? totSpend / totRes : 0;
    const avgCpm    = totImpr > 0 ? totSpend / totImpr * 1000 : 0;

    // Umumiy KPI qatori
    const kpiRow = document.getElementById("sumKpiRow");
    if (kpiRow) kpiRow.innerHTML = [
      { lbl:"Jami sarflangan",  val:"$"+Utils.fmt(totSpend),       icon:"💰", col:"#c8ff00" },
      { lbl:"Jami natijalar",   val:Utils.fmtN(totRes),             icon:"🎯", col:"#22c55e" },
      { lbl:"O'rtacha CPL",     val:"$"+Utils.fmt(avgCpl),          icon:"📉", col:"#3b82f6" },
      { lbl:"Jami impressions", val:Utils.fmtN(totImpr),            icon:"👁",  col:"#f59e0b" },
      { lbl:"Jami reach",       val:Utils.fmtN(totReach),           icon:"📡", col:"#06b6d4" },
      { lbl:"O'rtacha CPM",     val:"$"+Utils.fmt(avgCpm),          icon:"📊", col:"#a78bfa" },
    ].map(k => `
      <div class="sum-kpi-card" style="--skc:${k.col}">
        <div class="sum-kpi-icon">${k.icon}</div>
        <div class="sum-kpi-val">${k.val}</div>
        <div class="sum-kpi-lbl">${k.lbl}</div>
      </div>`).join("");

    // CPL bo'yicha tartiblash (arzondan qimmatga)
    const sorted = [...channels].filter(c => c.cpl > 0).sort((a,b) => a.cpl - b.cpl);
    const maxCpl  = sorted.length ? sorted[sorted.length-1].cpl : 1;

    const PLATFORM_ICONS = {
      "meta ads": "📘", "facebook": "📘", "instagram": "📸",
      "telegram ads": "✈️", "telegram": "✈️",
      "google ads": "🔵", "google": "🔵",
      "yandex direct": "🟡", "yandex": "🟡",
    };
    function platformIcon(name) {
      const key = name.toLowerCase();
      for (const [k,v] of Object.entries(PLATFORM_ICONS)) if (key.includes(k)) return v;
      return "📊";
    }

    // Kanal kartochkalari
    const chEl = document.getElementById("sumChannels");
    if (chEl) chEl.innerHTML = channels.map((ch, i) => {
      const share    = totSpend > 0 ? (ch.spend / totSpend * 100).toFixed(1) : 0;
      const barPct   = maxCpl > 0 && ch.cpl > 0 ? (ch.cpl / maxCpl * 100).toFixed(1) : 0;
      const isBest   = sorted.length && sorted[0].name === ch.name;
      const isWorst  = sorted.length > 1 && sorted[sorted.length-1].name === ch.name;
      const badge    = isBest  ? '<span class="sum-badge best">✓ Eng arzon</span>'
                     : isWorst ? '<span class="sum-badge worst">⚠ Eng qimmat</span>'
                     : '';
      const cplColor = isBest ? "#22c55e" : isWorst ? "#ef4444" : "#c8ff00";
      return `
      <div class="sum-ch-card${isBest?" sum-ch-best":isWorst?" sum-ch-worst":""}">
        <div class="sum-ch-top">
          <div class="sum-ch-name">${platformIcon(ch.name)} ${ch.name}</div>
          ${badge}
        </div>
        <div class="sum-ch-metrics">
          <div class="sum-ch-metric">
            <div class="sum-ch-mlbl">Sarflangan</div>
            <div class="sum-ch-mval">$${Utils.fmt(ch.spend)}</div>
            <div class="sum-ch-msub">${share}% ulush</div>
          </div>
          <div class="sum-ch-metric">
            <div class="sum-ch-mlbl">Natijalar</div>
            <div class="sum-ch-mval">${Utils.fmtN(ch.res)}</div>
            <div class="sum-ch-msub">${ch.camps} kampaniya</div>
          </div>
          <div class="sum-ch-metric">
            <div class="sum-ch-mlbl">CPL</div>
            <div class="sum-ch-mval" style="color:${cplColor}">$${Utils.fmt(ch.cpl)}</div>
            <div class="sum-ch-msub">natija narxi</div>
          </div>
          <div class="sum-ch-metric">
            <div class="sum-ch-mlbl">CPM</div>
            <div class="sum-ch-mval">$${Utils.fmt(ch.cpm)}</div>
            <div class="sum-ch-msub">1000 ko'rsatish</div>
          </div>
        </div>
        <div class="sum-ch-bar-wrap">
          <div class="sum-ch-bar" style="width:${barPct}%;background:${cplColor}"></div>
        </div>
      </div>`;
    }).join("");

    // Xulosa verdict
    const verdEl = document.getElementById("sumVerdict");
    if (verdEl && sorted.length >= 2) {
      const best  = sorted[0];
      const worst = sorted[sorted.length-1];
      const diff  = worst.cpl > 0 ? ((worst.cpl - best.cpl) / worst.cpl * 100).toFixed(0) : 0;
      verdEl.innerHTML = `
        <div class="sum-verd-card best">
          <div class="sum-verd-icon">🏆</div>
          <div class="sum-verd-body">
            <div class="sum-verd-title">Eng samarali kanal</div>
            <div class="sum-verd-name">${platformIcon(best.name)} ${best.name}</div>
            <div class="sum-verd-stat">CPL: <strong>$${Utils.fmt(best.cpl)}</strong> · ${Utils.fmtN(best.res)} natija</div>
          </div>
        </div>
        <div class="sum-verd-mid">
          <div class="sum-verd-diff">${diff}%<br><span>qimmatroq</span></div>
        </div>
        <div class="sum-verd-card worst">
          <div class="sum-verd-icon">⚠️</div>
          <div class="sum-verd-body">
            <div class="sum-verd-title">Eng qimmat kanal</div>
            <div class="sum-verd-name">${platformIcon(worst.name)} ${worst.name}</div>
            <div class="sum-verd-stat">CPL: <strong>$${Utils.fmt(worst.cpl)}</strong> · ${Utils.fmtN(worst.res)} natija</div>
          </div>
        </div>`;
    } else {
      if (verdEl) verdEl.innerHTML = "";
    }
  }

  // ── PUBLIC: select report pill ───────────────────────────────
  function select(idx) {
    document.querySelectorAll(".rpt-pill").forEach((p,i) => p.classList.toggle("active", i===idx));
    _render(_reports[idx]);
  }

  // ── PUBLIC: delete report ────────────────────────────────────
  async function del(e, idx) {
    e.stopPropagation();
    const r = _reports[idx];
    if (!r) return;
    const label = r.meta?.platform || r.sourceFile || "Hisobot";
    const msg = window.I18n && I18n.getLang() === 'ru'
      ? `Удалить отчёт "${label}"?`
      : `"${label}" hisobotini o'chirasizmi?`;
    if (!confirm(msg)) return;
    if (_onDelete) await _onDelete(r.id);
    _reports.splice(idx, 1);
    _channels = {};
    if (!_reports.length) {
      document.getElementById("emptyState").style.display  = "flex";
      document.getElementById("dashContent").style.display = "none";
      document.getElementById("filterBar").style.display   = "none";
      return;
    }
    _buildChannels(_reports);
    _buildPills(_reports);
    _renderSummary(_reports);
    _render(_reports[0]);
  }

  // ── FILTER PILLS ─────────────────────────────────────────────
  function _buildPills(reports) {
    if (reports.length < 2) return;
    const bar   = document.getElementById("filterBar");
    const pills = document.getElementById("filterPills");
    if (!bar || !pills) return;
    bar.style.display = "flex";

    pills.innerHTML = reports.map((r, i) => {
      const platform = r.meta?.platform || r.sourceFile || "Hisobot";
      const ts       = r.meta?.uploaded || (r.uploadedAt?.seconds ? new Date(r.uploadedAt.seconds*1000) : null);
      const date     = ts ? new Date(ts).toLocaleDateString("ru",{day:"2-digit",month:"short"}) : "";
      const label    = platform + (date ? " · "+date : "");
      return `<button class="rpt-pill${i===0?" active":""}" onclick="App.select(${i})" id="rp${i}">
        <span class="rp-dot"></span>${label}
        <span class="rp-del" onclick="App.del(event,${i})">×</span>
      </button>`;
    }).join("");
  }

  // ── BUILD CHANNELS (for compare) ─────────────────────────────
  function _buildChannels(reports) {
    const COLS = Utils.COLORS;
    reports.forEach((r, i) => {
      const key = (r.meta?.platform || r.sourceFile || "Kanal "+i).slice(0,22);
      const cps = r.campaigns || [];
      const sp  = cps.reduce((s,c) => s+(c.metrics?.spent_usd||0), 0);
      const rs  = cps.reduce((s,c) => s+(c.metrics?.results||0),   0);
      if (!_channels[key]) {
        _channels[key] = { cpl:rs>0?sp/rs:0, spend:sp, res:rs, color:COLS[Object.keys(_channels).length % COLS.length] };
      }
    });
  }

  // ── RENDER DASHBOARD ─────────────────────────────────────────
  function _render(data) {
    document.getElementById("dashContent").style.display = "block";
    document.getElementById("emptyState").style.display  = "none";

    const { meta={}, campaigns=[], totals={} } = data;

    // Period
    const period = (meta.period_start && meta.period_end)
      ? meta.period_start+" — "+meta.period_end
      : (meta.period || "—");
    const pp = document.getElementById("periodPill");
    if (pp) pp.textContent = period;

    if (meta.uploaded || meta.uploadedAt) {
      const d = new Date(meta.uploaded || (meta.uploadedAt?.seconds ? meta.uploadedAt.seconds*1000 : meta.uploadedAt));
      const rd = document.getElementById("reportDate");
      if (rd) rd.textContent = "Yuklangan: "+d.toLocaleDateString("ru",{day:"2-digit",month:"short",year:"numeric"});
    }

    // ── Aggregate KPIs ────────────────────────────────────────
    const spend   = totals.spent_usd   || campaigns.reduce((s,c) => s+(c.metrics?.spent_usd||0),           0);
    const results = totals.results     || campaigns.reduce((s,c) => s+(c.metrics?.results||0),              0);
    const impr    = totals.impressions || campaigns.reduce((s,c) => s+(c.metrics?.impressions||0),          0);
    const reach   =                       campaigns.reduce((s,c) => s+(c.metrics?.reach||0),                0);
    const cpl     = results>0 ? spend/results : 0;
    const cpm     = impr>0    ? spend/impr*1000 : 0;
    const cr      = reach>0   ? results/reach*100 : 0;
    const sorted  = [...campaigns].filter(c=>c.metrics?.results>0).sort((a,b)=>(a.metrics.cost_per_result_usd||999)-(b.metrics.cost_per_result_usd||999));
    const bestCpl = sorted[0]?.metrics?.cost_per_result_usd || 0;
    const bestName= Utils.shortName(sorted[0]?.name||"—");

    // ── Animate KPI counters ──────────────────────────────────
    const kpis = [
      { id:"kpiSpend",   val:spend,   pre:"$", suf:"",  dec:2 },
      { id:"kpiResults", val:results, pre:"",  suf:"",  dec:0 },
      { id:"kpiCpl",     val:cpl,     pre:"$", suf:"",  dec:2 },
      { id:"kpiImpr",    val:impr,    pre:"",  suf:"",  dec:0 },
      { id:"kpiCpm",     val:cpm,     pre:"$", suf:"",  dec:2 },
      { id:"kpiReach",   val:reach,   pre:"",  suf:"",  dec:0 },
      { id:"kpiBestCpl", val:bestCpl, pre:"$", suf:"",  dec:2 },
      { id:"kpiCr",      val:cr,      pre:"",  suf:"%", dec:2 },
    ];
    kpis.forEach(k => Utils.animateCounter(document.getElementById(k.id), k.val, k.pre, k.suf, k.dec));

    // ── KPI sub-labels ────────────────────────────────────────
    const _i = k => window.I18n ? I18n.t(k) : null;
    const _nSfx = (n, key) => { const s = _i(key); return s ? n + ' ' + s : String(n); };
    _setText("kpiSpendSub",   _nSfx(campaigns.length, 'kpi.n_campaigns'));
    _setText("kpiResultsSub", campaigns[0]?.result_types?.[0] || (_i('kpi.total_results') || "jami natija"));
    _setText("kpiBestCplName",bestName.slice(0,16));

    // ── Trend badges (vs campaign average) ───────────────────
    _trend("trd0", spend,   0);
    _trend("trd1", results, 0, true);
    _trend("trd2", cpl,     0, false);
    _trend("trd3", impr,    0, true);
    _trend("trd4", cpm,     0, false);
    _trend("trd5", reach,   0, true);

    // ── Sparklines ───────────────────────────────────────────
    const cplArr   = campaigns.map(c => c.metrics?.cost_per_result_usd||0);
    const spendArr = campaigns.map(c => c.metrics?.spent_usd||0);
    const resArr   = campaigns.map(c => c.metrics?.results||0);
    const imprArr  = campaigns.map(c => c.metrics?.impressions||0);
    const reachArr = campaigns.map(c => c.metrics?.reach||0);
    const cpmArr   = campaigns.map(c => c.metrics?.cpm_usd||0);

    Charts.renderSparkline("spk0", spendArr, "#c8ff00");
    Charts.renderSparkline("spk1", resArr,   "#22c55e");
    Charts.renderSparkline("spk2", cplArr,   "#3b82f6");
    Charts.renderSparkline("spk3", imprArr,  "#f59e0b");
    Charts.renderSparkline("spk4", cpmArr,   "#a78bfa");
    Charts.renderSparkline("spk5", reachArr, "#06b6d4");
    Charts.renderSparkline("spk6", cplArr.filter(v=>v>0).sort((a,b)=>a-b), "#f97316");
    Charts.renderSparkline("spk7", campaigns.map(c=>{const r=c.metrics?.reach||0,res=c.metrics?.results||0;return r>0?res/r*100:0;}), "#ec4899");

    // ── Campaign count ────────────────────────────────────────
    const _cntSfx = window.I18n ? I18n.t('kpi.count_ta') : 'ta';
    _setText("campCount", _cntSfx ? campaigns.length + ' ' + _cntSfx : String(campaigns.length));

    // ── Expose to assistant ───────────────────────────────────
    window._currentData = data;
    if (window.Assistant) Assistant.onDataLoad(data);

    // ── Charts ───────────────────────────────────────────────
    Charts.renderFunnel(campaigns);
    Charts.renderCPL(campaigns);
    Charts.renderSpend(campaigns);
    Charts.renderScatter(campaigns);
    Charts.renderHeatmap(campaigns);
    Charts.renderChannelCompare(_channels);

    // ── Table ─────────────────────────────────────────────────
    _renderTable(campaigns);
  }

  function _trend(id, val, prev=0, higherGood=true) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!prev) { el.className="kpi-trend neu"; el.textContent="—"; return; }
    const diff = ((val-prev)/prev*100).toFixed(1);
    const up   = val > prev;
    const good = higherGood ? up : !up;
    el.className = "kpi-trend "+(good?"up":"down");
    el.textContent = (up?"↑":"↓")+" "+Math.abs(diff)+"%";
  }

  function _setText(id, v) { const e=document.getElementById(id); if(e) e.textContent=v; }

  function _renderTable(campaigns) {
    const tbody = document.getElementById("campTableBody");
    if (!tbody) return;
    tbody.innerHTML = campaigns.map(c => {
      const m   = c.metrics||{};
      const h   = Utils.health(m);
      const rts = (c.result_types||[]).map(r=>`<span class="rt-bdg">${r}</span>`).join(" ");
      return `<tr>
        <td title="${c.name||""}">${Utils.shortName(c.name)}</td>
        <td>${rts||"—"}</td>
        <td><span class="hbdg ${h.cls}">● ${h.lbl}</span></td>
        <td class="num"><span class="bdg-spend">$${Utils.fmt(m.spent_usd||0)}</span></td>
        <td class="num">${Utils.fmtN(m.results||0)}</td>
        <td class="num"><span class="bdg-cpl">$${Utils.fmt(m.cost_per_result_usd||0)}</span></td>
        <td class="num">$${Utils.fmt(m.cpm_usd||0)}</td>
        <td class="num">${Utils.fmtN(m.impressions||0)}</td>
        <td class="num">${Utils.fmtN(m.reach||0)}</td>
      </tr>`;
    }).join("");
  }

  return { init, select, del };
})();

// Expose to global for onclick handlers
window.App = App;
