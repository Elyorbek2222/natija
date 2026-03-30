/* ── utils.js — Formatting, colors, base chart options ─────────── */
const Utils = (() => {

  const COLORS = [
    "#c8ff00","#22c55e","#3b82f6","#f59e0b",
    "#ef4444","#a78bfa","#06b6d4","#f97316","#ec4899","#a855f7"
  ];

  function fmt(n, dec=2)  { return (+n||0).toFixed(dec); }
  function fmtN(n)        { return (+n||0).toLocaleString("ru"); }
  function fmtShort(n) {
    n = +n||0;
    if (n >= 1e6) return (n/1e6).toFixed(1)+"M";
    if (n >= 1e3) return (n/1e3).toFixed(0)+"K";
    return n.toFixed(0);
  }

  function animateCounter(el, target, prefix="", suffix="", dec=0) {
    if (!el) return;
    const dur = 900;
    const start = performance.now();
    (function step(now) {
      const p    = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val  = target * ease;
      el.textContent = prefix + (dec > 0 ? val.toFixed(dec) : fmtN(Math.round(val))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  function health(m) {
    const cpm = m.cpm_usd||0, res = m.results||0, imp = m.impressions||1;
    const rpi = res / imp * 1000;
    if (cpm > 5 && rpi < 0.3) return { cls:"bad",  lbl:"Charchagan" };
    if (cpm > 3 || rpi < 0.5) return { cls:"warn", lbl:"Kuzatish"   };
    return                            { cls:"good", lbl:"Yaxshi"     };
  }

  function shortName(name) {
    return (name||"")
      .replace(/^[A-Z]{1,4}\s*\|\s*/i, "")
      .replace(/\s*\|\s*.*/,            "")
      .trim().slice(0, 22);
  }

  function getBaseOpts() {
    return {
      chart: {
        background:   "transparent",
        toolbar:      { show:false },
        fontFamily:   "Inter, sans-serif",
        animations:   { enabled:true, speed:600, animateGradually:{ enabled:true, delay:80 } }
      },
      theme:      { mode:"dark" },
      grid:       { borderColor:"rgba(255,255,255,0.05)", strokeDashArray:3, padding:{ left:4, right:4 } },
      dataLabels: { enabled:false },
      legend:     { show:false },
      tooltip:    { theme:"dark", style:{ fontSize:"12px" } }
    };
  }

  return { COLORS, fmt, fmtN, fmtShort, animateCounter, health, shortName, getBaseOpts };
})();
