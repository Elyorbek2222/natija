/* ── charts.js — All ApexCharts render functions ───────────────── */
const Charts = (() => {
  const _inst = {};

  function _mount(id, opts) {
    if (_inst[id]) { _inst[id].destroy(); delete _inst[id]; }
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = "";
    _inst[id] = new ApexCharts(el, opts);
    _inst[id].render();
  }

  // ── SPARKLINE ────────────────────────────────────────────────
  function renderSparkline(id, data, color) {
    const el = document.getElementById(id);
    if (!el || !data || !data.length) return;
    el.innerHTML = "";
    new ApexCharts(el, {
      chart:  { type:"area", height:40, width:84, sparkline:{ enabled:true }, background:"transparent", animations:{ enabled:false } },
      series: [{ data }],
      colors: [color],
      stroke: { width:1.5, curve:"smooth" },
      fill:   { type:"gradient", gradient:{ opacityFrom:.4, opacityTo:0 } },
      tooltip:{ enabled:false },
      theme:  { mode:"dark" }
    }).render();
  }

  // ── FUNNEL — % based, custom HTML bars ───────────────────────
  function renderFunnel(campaigns) {
    const el = document.getElementById("funnelBlock");
    if (!el) return;

    const impr  = campaigns.reduce((s,c) => s+(c.metrics?.impressions||0), 0);
    const reach = campaigns.reduce((s,c) => s+(c.metrics?.reach||0),       0);
    const res   = campaigns.reduce((s,c) => s+(c.metrics?.results||0),     0);

    if (!impr) { el.innerHTML = '<div class="ch-empty">Ma\'lumot yo\'q</div>'; return; }

    const steps = [
      { lbl:"Impressions", val:impr,  pct:100,                                                  color:"#3b82f6" },
    ];
    if (reach > 0) steps.push({ lbl:"Reach",      val:reach, pct:+(reach/impr*100).toFixed(1), color:"#a78bfa" });
    steps.push(    { lbl:"Natijalar",  val:res,   pct:+(res/impr*100).toFixed(2),               color:"#22c55e" });

    el.innerHTML = steps.map((s, i) => `
      <div class="funnel-step">
        <div class="fs-lbl">${s.lbl}</div>
        <div class="fs-bar-wrap">
          <div class="fs-bar-fill" style="width:${Math.max(s.pct,2)}%;background:${s.color}18;border-left:3px solid ${s.color}">
            <span class="fs-bar-inner" style="color:${s.color}">${Utils.fmtN(s.val)}</span>
          </div>
        </div>
        <div class="fs-right">
          <div class="fs-val" style="color:${s.color}">${s.pct}%</div>
          ${i>0 ? `<div class="fs-drop">↓ ${(100-s.pct).toFixed(1)}% tushdi</div>` : ""}
        </div>
      </div>
    `).join("");
  }

  // ── CPL — horizontal bar, sorted ascending ───────────────────
  function renderCPL(campaigns) {
    const data = [...campaigns]
      .filter(c => c.metrics?.cost_per_result_usd > 0)
      .sort((a,b) => a.metrics.cost_per_result_usd - b.metrics.cost_per_result_usd);

    if (!data.length) return;

    const colors = data.map(c => {
      const v = c.metrics.cost_per_result_usd;
      return v < 1 ? "#22c55e" : v < 3 ? "#f59e0b" : "#ef4444";
    });

    _mount("chartCPL", {
      ...Utils.getBaseOpts(),
      chart:       { ...Utils.getBaseOpts().chart, type:"bar", height:Math.max(200, data.length*44) },
      plotOptions: { bar:{ horizontal:true, borderRadius:4, barHeight:"60%", distributed:true } },
      series:      [{ name:"CPL ($)", data:data.map(c => +c.metrics.cost_per_result_usd.toFixed(2)) }],
      xaxis:       { categories:data.map(c=>Utils.shortName(c.name)), labels:{ style:{colors:"#6b7280",fontSize:"10px"}, formatter:v=>"$"+Utils.fmtShort(v) } },
      yaxis:       { labels:{ style:{colors:"#9ca3af",fontSize:"10px"}, maxWidth:130 } },
      colors,
      fill:        { colors },
      dataLabels:  { enabled:true, formatter:v=>"$"+Utils.fmt(v), style:{fontSize:"10px",colors:["#f0f2f5"]}, offsetX:4 },
      tooltip:     { y:{ formatter:v=>"$"+Utils.fmt(v) } },
      legend:      { show:false }
    });
  }

  // ── SPEND — vertical bar, sorted descending ──────────────────
  function renderSpend(campaigns) {
    const data = [...campaigns].sort((a,b) => (b.metrics?.spent_usd||0)-(a.metrics?.spent_usd||0));

    _mount("chartSpend", {
      ...Utils.getBaseOpts(),
      chart:       { ...Utils.getBaseOpts().chart, type:"bar", height:220 },
      plotOptions: { bar:{ borderRadius:5, columnWidth:"58%", distributed:true } },
      series:      [{ name:"Xarajat ($)", data:data.map(c=>+((c.metrics?.spent_usd||0).toFixed(2))) }],
      xaxis:       { categories:data.map(c=>Utils.shortName(c.name)), labels:{ style:{colors:"#6b7280",fontSize:"10px"}, trim:true, hideOverlappingLabels:true, maxHeight:52 } },
      yaxis:       { labels:{ style:{colors:"#6b7280",fontSize:"10px"}, formatter:v=>"$"+Utils.fmtShort(v) } },
      colors:      Utils.COLORS,
      legend:      { show:false },
      tooltip:     { y:{ formatter:v=>"$"+Utils.fmt(v) } }
    });
  }

  // ── SCATTER — CPM vs CPL ─────────────────────────────────────
  function renderScatter(campaigns) {
    const pts = campaigns
      .filter(c => c.metrics?.cpm_usd>0 && c.metrics?.cost_per_result_usd>0)
      .map(c => ({ x:+c.metrics.cpm_usd.toFixed(2), y:+c.metrics.cost_per_result_usd.toFixed(2), n:Utils.shortName(c.name) }));

    if (!pts.length) {
      const el = document.getElementById("chartScatter");
      if (el) el.innerHTML = '<div class="ch-empty">CPM/CPL ma\'lumot yo\'q</div>';
      return;
    }

    const maxX = Math.max(...pts.map(p=>p.x)) * 1.25 || 10;
    const maxY = Math.max(...pts.map(p=>p.y)) * 1.25 || 10;

    _mount("chartScatter", {
      ...Utils.getBaseOpts(),
      chart:   { ...Utils.getBaseOpts().chart, type:"scatter", height:240 },
      series:  [{ name:"Kampaniya", data:pts.map(p=>[p.x,p.y]) }],
      xaxis:   { title:{text:"CPM ($)",style:{color:"#6b7280",fontSize:"10px"}}, min:0, max:maxX, tickAmount:5, labels:{style:{colors:"#6b7280",fontSize:"10px"},formatter:v=>"$"+Utils.fmtShort(v)} },
      yaxis:   { title:{text:"CPL ($)",style:{color:"#6b7280",fontSize:"10px"}}, min:0, max:maxY, tickAmount:5, labels:{style:{colors:"#6b7280",fontSize:"10px"},formatter:v=>"$"+Utils.fmtShort(v)} },
      colors:  ["#a78bfa"],
      markers: { size:10, strokeWidth:0 },
      tooltip: {
        custom:({dataPointIndex:i}) => `
          <div style="padding:8px 12px;background:#1a1d28;border:1px solid rgba(255,255,255,.1);border-radius:8px;font-size:11px;font-family:Inter,sans-serif">
            <b style="color:#f0f2f5">${pts[i]?.n||""}</b><br>
            <span style="color:#a78bfa">CPM:</span> <span style="font-family:JetBrains Mono,monospace">$${Utils.fmt(pts[i]?.x||0)}</span><br>
            <span style="color:#22c55e">CPL:</span> <span style="font-family:JetBrains Mono,monospace">$${Utils.fmt(pts[i]?.y||0)}</span>
          </div>`
      }
    });
  }

  // ── HEATMAP — campaign performance matrix ────────────────────
  function renderHeatmap(campaigns) {
    const el = document.getElementById("chartHeatmap");
    if (!el) return;
    if (campaigns.length < 2) {
      el.innerHTML = '<div class="ch-empty" style="padding:30px">Kamida 2 ta kampaniya kerak</div>';
      return;
    }

    const names = campaigns.map(c => Utils.shortName(c.name));

    function norm(arr, higherBetter) {
      const mn = Math.min(...arr), mx = Math.max(...arr);
      if (mx === mn) return arr.map(() => 50);
      return arr.map(v => higherBetter
        ? Math.round((v-mn)/(mx-mn)*100)
        : Math.round((1-(v-mn)/(mx-mn))*100));
    }

    const series = [
      { name:"CPL",         data: norm(campaigns.map(c=>c.metrics?.cost_per_result_usd||0), false).map((v,i)=>({x:names[i],y:v})) },
      { name:"CPM",         data: norm(campaigns.map(c=>c.metrics?.cpm_usd||0),             false).map((v,i)=>({x:names[i],y:v})) },
      { name:"Natijalar",   data: norm(campaigns.map(c=>c.metrics?.results||0),              true ).map((v,i)=>({x:names[i],y:v})) },
      { name:"Impressions", data: norm(campaigns.map(c=>c.metrics?.impressions||0),          true ).map((v,i)=>({x:names[i],y:v})) },
    ];

    _mount("chartHeatmap", {
      ...Utils.getBaseOpts(),
      chart:       { ...Utils.getBaseOpts().chart, type:"heatmap", height:200 },
      series,
      dataLabels:  { enabled:true, style:{ fontSize:"10px", colors:["#0d0f14"], fontWeight:700 }, formatter:v=>v+"/100" },
      colors:      ["#22c55e"],
      plotOptions: { heatmap:{ shadeIntensity:.65, colorScale:{ ranges:[
        { from:0,  to:33,  color:"#ef4444", name:"Past"   },
        { from:34, to:66,  color:"#f59e0b", name:"O'rta"  },
        { from:67, to:100, color:"#22c55e", name:"Yaxshi" }
      ]}}},
      xaxis:       { labels:{ style:{ colors:"#9ca3af", fontSize:"9px" }, trim:true, hideOverlappingLabels:true } },
      tooltip:     { y:{ formatter:v=>v+"/100 ball" } }
    });
  }

  // ── CHANNEL COMPARE — custom HTML bars ───────────────────────
  function renderChannelCompare(channels) {
    const wrap = document.getElementById("channelCompare");
    if (!wrap) return;

    const entries = Object.entries(channels);
    if (entries.length < 2) {
      wrap.innerHTML = '<div class="ch-empty">Taqqoslash uchun bir necha platform faylini yuklang</div>';
      return;
    }

    const maxCpl = Math.max(...entries.map(([,v])=>v.cpl)) || 1;
    const bestKey = entries.reduce((a,b) => a[1].cpl < b[1].cpl ? a : b)[0];

    wrap.innerHTML = entries.map(([name,d]) => `
      <div class="ch-row">
        <div class="ch-dot" style="background:${d.color}"></div>
        <div class="ch-name">${name}</div>
        <div class="ch-bar-bg"><div class="ch-bar-fill" style="background:${d.color};width:${d.cpl/maxCpl*100}%"></div></div>
        <div class="ch-cpl" style="color:${d.color}">$${Utils.fmt(d.cpl)}</div>
        ${name===bestKey ? '<div class="ch-best">Eng arzon ✓</div>' : '<div style="width:72px"></div>'}
      </div>
    `).join("");
  }

  return { renderSparkline, renderFunnel, renderCPL, renderSpend, renderScatter, renderHeatmap, renderChannelCompare };
})();
