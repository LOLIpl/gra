if(typeof rand==="undefined") window.rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
if(typeof clamp==="undefined") window.clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

// === FUNKCJE POMOCNICZE ===
function escapeHtml(str) { if (str == null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function round2(n) { return Math.round((n||0)*100)/100; }
function formatMoney(val) { return Number(val||0).toFixed(2); }
function initials(name) { if (!name) return '??'; return name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,3); }
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
function closeModal() { document.getElementById('modal')?.classList.remove('active'); }

const FORMATIONS = {
    "4-3-3":{BR:1,OB:4,PO:3,NA:3,positions:[{top:88,left:50},{top:68,left:15},{top:68,left:38},{top:68,left:62},{top:68,left:85},{top:45,left:25},{top:45,left:50},{top:45,left:75},{top:18,left:20},{top:18,left:50},{top:18,left:80}]},
    "4-4-2":{BR:1,OB:4,PO:4,NA:2,positions:[{top:88,left:50},{top:68,left:15},{top:68,left:38},{top:68,left:62},{top:68,left:85},{top:42,left:15},{top:42,left:38},{top:42,left:62},{top:42,left:85},{top:18,left:38},{top:18,left:62}]},
    "4-2-3-1":{BR:1,OB:4,PO:5,NA:1,positions:[{top:88,left:50},{top:68,left:15},{top:68,left:38},{top:68,left:62},{top:68,left:85},{top:50,left:30},{top:50,left:70},{top:35,left:20},{top:35,left:50},{top:35,left:80},{top:15,left:50}]},
    "3-5-2":{BR:1,OB:3,PO:5,NA:2,positions:[{top:88,left:50},{top:68,left:25},{top:68,left:50},{top:68,left:75},{top:50,left:15},{top:50,left:35},{top:50,left:50},{top:50,left:65},{top:50,left:85},{top:18,left:38},{top:18,left:62}]},
};
const POS_MAP = {BR:"BR",OB:"ŚO",PO:"ŚP",NA:"N"};
const MONTHS = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const DAY_NAMES = ["Pn","Wt","Sr","Cz","Pt","Sb","Nd"];
const POS_ICON = {BR:"BR",OB:"ŚO",PO:"ŚP",NA:"N"};
const AI_STYLES = ["balanced","attacking","defensive","possession","counter"];
// FORM_ICON, UEFA_CUPS, UEFA_CODE_ALIASES
const LEAGUE_RULES = {
    GB1:{down:"GB2",relegation:3,playoffRelegation:0}, GB2:{up:"GB1",promotion:2,playoffPromotion:[3,4,5,6],relegation:3},
    ES1:{down:"ES2",relegation:3,playoffRelegation:0}, ES2:{up:"ES1",promotion:2,playoffPromotion:[3,4,5,6],relegation:4},
    IT1:{down:"IT2",relegation:3,playoffRelegation:0}, IT2:{up:"IT1",promotion:2,playoffPromotion:[3,4,5,6,7,8],relegation:3,playoffRelegation:1},
    L1:{down:"L2",relegation:2,playoffRelegation:1}, L2:{up:"L1",promotion:2,playoffPromotion:[3],relegation:2,playoffRelegation:1},
    FR1:{down:"FR2",relegation:2,playoffRelegation:1}, FR2:{up:"FR1",promotion:2,playoffPromotion:[3,4,5],relegation:3},
    PO1:{down:"PO2",relegation:2,playoffRelegation:1}, PO2:{up:"PO1",promotion:2,playoffPromotion:[3],relegation:2},
    NL1:{down:"NL2",relegation:2,playoffRelegation:1}, NL2:{up:"NL1",promotion:2,playoffPromotion:[3,4,5,6,7,8],relegation:0},
    PL1:{down:"PL2",relegation:3,playoffRelegation:0}, PL2:{up:"PL1",promotion:2,playoffPromotion:[3,4,5,6],relegation:3},
    TR1:{down:"TR2",relegation:4,playoffRelegation:0}, TR2:{up:"TR1",promotion:2,playoffPromotion:[3,4,5,6,7],relegation:4},
    BE1:{down:"BE2",relegation:1,playoffRelegation:1}, BE2:{up:"BE1",promotion:1,playoffPromotion:[2,3,4,5],relegation:1},
    DK1:{down:"DK2",relegation:2,playoffRelegation:0}, DK2:{up:"DK1",promotion:2,relegation:2},
    A1:{down:"A2",relegation:1,playoffRelegation:0}, A2:{up:"A1",promotion:1,relegation:3},
    NO1:{down:"NO2",relegation:2,playoffRelegation:1}, NO2:{up:"NO1",promotion:2,playoffPromotion:[3,4,5,6],relegation:2},
    SE1:{down:"SE2",relegation:2,playoffRelegation:1}, SE2:{up:"SE1",promotion:2,playoffPromotion:[3],relegation:2},
    TS1:{down:"TS2",relegation:1,playoffRelegation:2}, TS2:{up:"TS1",promotion:1,playoffPromotion:[2,3],relegation:2},
    RO1:{down:"RO2",relegation:2,playoffRelegation:2}, RO2:{up:"RO1",promotion:2,playoffPromotion:[3,4],relegation:4},
    GR1:{down:"GRS2",relegation:2,playoffRelegation:0}, GRS2:{up:"GR1",promotion:2,relegation:4},
};
let simSpeedMs = 500;

function injectGameplayStyles(){
  if(document.getElementById("career-polish-style")) return;
  const s = document.createElement("style");
  s.id = "career-polish-style";
  s.textContent = `
:root{
  --primary:#2563eb;--primary-light:#60a5fa;--accent-cyan:#06b6d4;
  --bg:#07090f;--card:#0f1520;--border:#1e2840;--text:#eef2ff;--muted:#8899bb;
  --fs-base:16px;--fs-sm:0.88rem;--fs-lg:1.05rem;
}
body{background:var(--bg);color:var(--text);
  font-family:'Segoe UI',system-ui,-apple-system,sans-serif;
  font-size:var(--fs-base);line-height:1.5;}
main{padding:.75rem;}

nav{display:flex;gap:.5rem;padding:.9rem 1.25rem;
  background:rgba(10,14,28,.92);backdrop-filter:blur(14px);
  border-bottom:1px solid rgba(255,255,255,.06);flex-wrap:wrap;
  position:sticky;top:0;z-index:100;}
nav button{background:transparent;border:1px solid transparent;color:var(--muted);
  padding:.75rem 1.3rem;border-radius:12px;font-weight:800;font-size:.92rem;
  cursor:pointer;transition:.15s;min-height:48px;letter-spacing:.01em;}
nav button:hover,nav button:focus{color:#fff;background:rgba(255,255,255,.07);
  outline:2px solid var(--primary);outline-offset:2px;}
nav button.active{color:#fff;background:var(--primary);border-color:var(--primary);
  box-shadow:0 0 16px rgba(37,99,235,.4);}

.card{background:var(--card);border:1px solid var(--border);border-radius:16px;
  padding:1.5rem;margin-bottom:1.1rem;
  box-shadow:0 8px 24px rgba(0,0,0,.35);backdrop-filter:blur(4px);}
.card h1{font-size:1.7rem;}.card h2{font-size:1.3rem;}.card h3{font-size:1.1rem;}
.card h1,.card h2,.card h3{margin:0 0 .7rem 0;color:#fff;}
.text-muted{color:var(--muted);}

.btn{background:var(--primary);color:#fff;border:none;border-radius:10px;
  padding:.85rem 1.4rem;font-weight:800;font-size:.95rem;cursor:pointer;
  min-height:48px;display:inline-flex;align-items:center;gap:.5rem;
  transition:filter .15s,box-shadow .15s;}
.btn:hover{filter:brightness(1.18);}
.btn:focus{outline:3px solid var(--primary-light);outline-offset:2px;}
.btn-secondary{background:#182035;color:var(--text);border:1px solid var(--border);}
.btn-accent{background:var(--accent-cyan);color:#000;}
.btn-orange{background:#f59e0b;color:#000;}
.btn-red{background:#ef4444;color:#fff;}
.btn-sm{padding:.55rem .95rem;font-size:.85rem;min-height:38px;}
.btn-lg{padding:1rem 1.7rem;font-size:1.05rem;min-height:54px;}
.btn-glow{box-shadow:0 0 18px rgba(37,99,235,.45);}

.badge{display:inline-block;padding:.25rem .6rem;border-radius:6px;font-size:.7rem;font-weight:700;background:#1f2937;color:var(--muted);}
.badge-neon{background:rgba(52,211,153,.15);color:#34d399;border:1px solid rgba(52,211,153,.3);}
.badge-season{background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid rgba(251,191,36,.3);}
.badge-orange{background:rgba(245,158,11,.15);color:#f59e0b;}
.badge-blue{background:rgba(59,130,246,.15);color:#60a5fa;}
.badge-lg{padding:.35rem .8rem;font-size:.8rem;}

.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;}
.card-header-compact{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;}

.news-scroll-container{max-height:220px;overflow-y:auto;padding-right:.5rem;}
.table-container{overflow-x:auto;}
.full-width-btn{width:100%;justify-content:center;}

.dashboard-content{display:flex;gap:1.25rem;flex-wrap:wrap;}
.dashboard-left{flex:1 1 340px;min-width:300px;}
.dashboard-table-card{flex:2 1 400px;min-width:300px;}
.match-preview-card .scoreboard-display{display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,.25);border-radius:10px;padding:.75rem;margin-bottom:.75rem;}
.sc-team{display:flex;flex-direction:column;align-items:center;gap:.4rem;flex:1;text-align:center;}
.sc-logo{width:44px;height:44px;border-radius:50%;background:#1f2937;border:2px solid rgba(255,255,255,.1);}
.sc-name{font-weight:700;font-size:.82rem;color:#fff;max-width:110px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sc-score-area{display:flex;flex-direction:column;align-items:center;gap:.2rem;flex:0 0 70px;}
.sc-vs{font-size:.65rem;color:var(--muted);font-weight:700;}
.match-date{text-align:center;color:var(--muted);font-size:.82rem;margin-bottom:.75rem;}
.action-stack-row{display:flex;gap:.5rem;flex-wrap:wrap;}

.club-hero-card .huge-badge{width:64px;height:64px;border-radius:50%;background:#1f2937;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:900;color:#fff;flex-shrink:0;}
.club-header-layout{display:flex;align-items:center;gap:1rem;margin-bottom:1rem;}
.club-text-layout{flex:1;}
.club-title-row{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.2rem;}
.club-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;}
.stat-item{display:flex;align-items:center;gap:.5rem;color:var(--muted);font-size:.95rem;padding:.4rem 0;}
.stat-item span{color:#fff;font-weight:800;font-size:1.05rem;}
.stat-item.money span{color:#fbbf24;font-size:1.1rem;}
.stat-item.pos span{color:var(--accent-cyan);font-size:1.1rem;}

.sc-score{font-size:2rem;font-weight:900;color:#fff;}
.bc-score-display{font-size:3.5rem;font-weight:900;color:#fff;background:rgba(0,0,0,.45);padding:.4rem 1.4rem;border-radius:14px;}
.compact-table table{width:100%;border-collapse:collapse;font-size:.92rem;}
.compact-table th{text-align:left;color:var(--muted);font-size:.75rem;text-transform:uppercase;padding:.5rem .4rem;border-bottom:1px solid var(--border);}
.compact-table td{padding:.6rem .4rem;border-bottom:1px solid rgba(255,255,255,.04);}
.compact-table tr.highlight td{background:rgba(37,99,235,.12);color:#fff;}

.squad-bottom-grid{display:flex;flex-direction:column;gap:1rem;margin-top:1rem;}
.bench-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.6rem;}
.bench-player{display:flex;align-items:center;gap:.6rem;background:rgba(255,255,255,.02);border-radius:8px;padding:.45rem;cursor:grab;}
.squad-player{display:flex;align-items:center;gap:.6rem;background:rgba(255,255,255,.02);border-radius:8px;padding:.45rem;margin-bottom:.4rem;cursor:grab;transition:all .2s;}
.squad-player.elite{border:1px solid #ffd700;background:rgba(255,215,0,.1);box-shadow:0 0 12px rgba(255,215,0,.2);}
.squad-player.gold{border:1px solid #fbbf24;background:rgba(251,191,36,.08);box-shadow:0 0 10px rgba(251,191,36,.15);}
.squad-player.silver{border:1px solid #94a3b8;background:rgba(148,163,184,.08);box-shadow:0 0 8px rgba(148,163,184,.1);}
.squad-player.bronze{border:1px solid #cd7f32;background:rgba(205,127,50,.06);box-shadow:0 0 6px rgba(205,127,50,.08);}
.squad-player.dark{border:1px solid #333;background:rgba(0,0,0,.15);}
.player-rating-chip{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:.75rem;font-weight:800;}
.player-rating-chip.elite{background:rgba(255,215,0,.2);color:#ffd700;border:1px solid rgba(255,215,0,.4);}
.player-rating-chip.gold{background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid rgba(251,191,36,.3);}
.player-rating-chip.silver{background:rgba(148,163,184,.15);color:#94a3b8;border:1px solid rgba(148,163,184,.3);}
.player-rating-chip.bronze{background:rgba(205,127,50,.15);color:#cd7f32;border:1px solid rgba(205,127,50,.3);}
.player-rating-chip.dark{background:rgba(0,0,0,.3);color:#666;border:1px solid rgba(255,255,255,.08);}
.shirt-icon{display:inline-block;width:18px;height:16px;border-radius:3px 3px 2px 2px;position:relative;vertical-align:middle;margin-right:4px;font-size:0;flex-shrink:0;}
.shirt-icon::before{content:'';position:absolute;top:-3px;left:50%;transform:translateX(-50%);width:8px;height:3px;border-radius:1px 1px 0 0;}
.shirt-icon.br{background:#f59e0b;}.shirt-icon.br::before{background:#f59e0b;}
.shirt-icon.ob{background:#3b82f6;}.shirt-icon.ob::before{background:#3b82f6;}
.shirt-icon.po{background:#10b981;}.shirt-icon.po::before{background:#10b981;}
.shirt-icon.na{background:#ef4444;}.shirt-icon.na::before{background:#ef4444;}
.reserves-card{background:rgba(17,24,39,.9);}

.tactics-card{padding:0;overflow:hidden;background:var(--card);}
.tactics-pitch-layout{display:flex;flex-direction:column;min-height:620px;gap:1rem;}
.pitch-visual{width:100%;background:linear-gradient(to bottom,#1a6b3c 0%,#14532d 40%,#0f3d21 100%);border-radius:12px;position:relative;min-height:650px;overflow:hidden;border:2px solid #1f6b3c;}
.pitch-visual::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(0deg,transparent,transparent 8px,rgba(255,255,255,.03) 8px,rgba(255,255,255,.03) 9px);pointer-events:none;z-index:0;}
.formation-display{position:absolute;top:0;left:0;width:100%;height:100%;z-index:10;}
.pitch-markings{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;}
.pitch-markings .halfway-line{position:absolute;top:50%;left:0;right:0;height:2px;background:rgba(255,255,255,.25);}
.pitch-markings .center-circle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:130px;height:130px;border:2px solid rgba(255,255,255,.25);border-radius:50%;}
.pitch-markings .center-spot{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:6px;height:6px;background:rgba(255,255,255,.35);border-radius:50%;}
.pitch-markings .penalty-area-top{position:absolute;top:0;left:50%;transform:translateX(-50%);width:45%;height:18%;border:2px solid rgba(255,255,255,.25);border-top:none;}
.pitch-markings .penalty-area-bottom{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:45%;height:18%;border:2px solid rgba(255,255,255,.25);border-bottom:none;}
.pitch-markings .goal-area-top{position:absolute;top:0;left:50%;transform:translateX(-50%);width:18%;height:6%;border:2px solid rgba(255,255,255,.2);border-top:none;}
.pitch-markings .goal-area-bottom{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:18%;height:6%;border:2px solid rgba(255,255,255,.2);border-bottom:none;}
.pitch-markings .pen-spot-top{position:absolute;top:12%;left:50%;transform:translateX(-50%);width:5px;height:5px;background:rgba(255,255,255,.3);border-radius:50%;}
.pitch-markings .pen-spot-bottom{position:absolute;bottom:12%;left:50%;transform:translateX(-50%);width:5px;height:5px;background:rgba(255,255,255,.3);border-radius:50%;}
.pitch-markings .arc-top{position:absolute;top:16%;left:50%;transform:translateX(-50%);width:60px;height:30px;border:2px solid rgba(255,255,255,.2);border-radius:0 0 50% 50%;border-top:none;}
.pitch-markings .arc-bottom{position:absolute;bottom:16%;left:50%;transform:translateX(-50%);width:60px;height:30px;border:2px solid rgba(255,255,255,.2);border-radius:50% 50% 0 0;border-bottom:none;}
.pitch-markings .corner-tl{position:absolute;top:-1px;left:-1px;width:20px;height:10px;border:2px solid rgba(255,255,255,.2);border-radius:0 0 50% 0;border-top:none;border-left:none;}
.pitch-markings .corner-tr{position:absolute;top:-1px;right:-1px;width:20px;height:10px;border:2px solid rgba(255,255,255,.2);border-radius:0 0 0 50%;border-top:none;border-right:none;}
.pitch-markings .corner-bl{position:absolute;bottom:-1px;left:-1px;width:20px;height:10px;border:2px solid rgba(255,255,255,.2);border-radius:0 50% 0 0;border-bottom:none;border-left:none;}
.pitch-markings .corner-br{position:absolute;bottom:-1px;right:-1px;width:20px;height:10px;border:2px solid rgba(255,255,255,.2);border-radius:50% 0 0 0;border-bottom:none;border-right:none;}
.player-slot{position:absolute;display:flex;flex-direction:column;align-items:center;gap:.3rem;width:84px;cursor:pointer;z-index:10;}
.player-slot .shirt{width:56px;height:56px;background:#fff;border-radius:8px 8px 5px 5px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;font-size:.9rem;border:2px solid var(--primary);box-shadow:0 4px 12px rgba(0,0,0,.5);position:relative;}
.player-slot .shirt::before{content:'';position:absolute;top:-5px;left:50%;transform:translateX(-50%);width:14px;height:5px;background:var(--primary);border-radius:2px 2px 0 0;}
.player-slot .rating-badge{position:absolute;top:-12px;right:-12px;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:900;color:#fff;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5);}
.player-slot .name{background:rgba(0,0,0,.88);color:#fff;font-size:.72rem;font-weight:700;padding:3px 8px;border-radius:5px;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,.6);}
.formation-badge{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);z-index:20;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);color:#fff;padding:4px 14px;border-radius:20px;font-size:.75rem;font-weight:700;letter-spacing:.05em;border:1px solid rgba(255,255,255,.1);pointer-events:none;}
.card-header-clean{padding:.8rem 1.2rem;border-bottom:1px solid var(--border);}
.card-header-clean h2{margin:0;font-size:1.1rem;}
.formation-selector{display:flex;gap:.25rem;margin-top:.6rem;flex-wrap:wrap;}
.formation-selector button{background:#1f2937;border:1px solid #374151;color:var(--muted);padding:.25rem .5rem;border-radius:6px;font-size:.7rem;font-weight:700;cursor:pointer;}
.formation-selector button.active{background:var(--primary);color:#fff;border-color:var(--primary);}
.tactic-settings-box{padding:.8rem 1.2rem;border-bottom:1px solid var(--border);}
.settings-grid{display:grid;grid-template-columns:1fr;gap:.6rem;}
.s-field label{display:block;font-size:.7rem;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:.25rem;}
.s-field select{width:100%;background:#1f2937;border:1px solid #374151;color:#fff;border-radius:6px;padding:.4rem;font-size:.8rem;}
.squad-selection-area{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.squad-tabs{display:flex;border-bottom:1px solid var(--border);}
.squad-tabs button{flex:1;background:transparent;border:none;padding:.6rem;color:var(--muted);font-weight:700;font-size:.75rem;cursor:pointer;border-bottom:2px solid transparent;}
.squad-tabs button.active{color:var(--primary-light);border-bottom-color:var(--primary);}
.squad-list{flex:1;overflow-y:auto;padding:.8rem;}
.squad-player{display:flex;align-items:center;gap:.6rem;background:rgba(255,255,255,.02);border-radius:8px;padding:.45rem;margin-bottom:.4rem;cursor:grab;}
.squad-player .num{width:22px;text-align:center;font-weight:900;color:var(--muted);font-size:.78rem;}
.squad-player .info{flex:1;min-width:0;}
.squad-player .p-name{color:#fff;font-weight:700;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.squad-player .p-details{color:var(--muted);font-size:.68rem;}
.squad-player .rating{font-weight:800;color:var(--accent-cyan);font-size:.85rem;background:rgba(0,0,0,.3);padding:2px 5px;border-radius:4px;}

.transfer-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:.9rem;display:flex;flex-direction:column;gap:.45rem;}
.transfer-card .price-row{display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,.2);border-radius:6px;padding:.4rem .6rem;}
.transfer-card .price-row span:first-child{font-size:.68rem;color:var(--muted);text-transform:uppercase;font-weight:700;}
.transfer-card .price{font-weight:800;color:#fbbf24;}
.transfer-card .wage{font-size:.85rem;font-weight:700;color:#fff;}
.transfer-status{font-size:.68rem;font-weight:700;text-align:center;padding:3px;border-radius:4px;}
.transfer-status.budget-ok{background:rgba(16,185,129,.1);color:#10b981;}
.transfer-status.budget-risk{background:rgba(239,68,68,.1);color:#ef4444;}
.nego-hint{
  font-size:.72rem;color:#6b7280;background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.06);border-radius:6px;
  padding:.4rem .6rem;margin-bottom:.6rem;line-height:1.5;
}
.nego-label{display:block;font-size:.7rem;color:var(--muted);font-weight:700;margin-bottom:.25rem;}
.nego-rounds{font-size:.7rem;color:var(--muted);text-align:right;margin-top:.3rem;}
.nego-feedback{
  border-radius:8px;padding:.55rem .75rem;font-size:.82rem;font-weight:700;
  margin-bottom:.6rem;line-height:1.4;
}
.nego-ok{ background:rgba(16,185,129,.12);color:#10b981;border:1px solid rgba(16,185,129,.25);}
.nego-bad{background:rgba(239,68,68,.12); color:#ef4444;border:1px solid rgba(239,68,68,.25);}
.nego-grid{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:.3rem;}
.nego-grid input{
  width:100%;background:#0f1828;border:1px solid var(--border);color:#fff;
  border-radius:8px;padding:.55rem .7rem;font-size:.88rem;font-weight:700;
}
.nego-grid input:focus{border-color:var(--primary);outline:none;box-shadow:0 0 0 2px rgba(37,99,235,.25);}
.nego-box{display:none;margin-top:.6rem;padding:.8rem;background:rgba(0,0,0,.3);border-radius:10px;border:1px solid rgba(255,255,255,.07);}
.nego-box.active{display:block;}

.calendar-layout-container{display:flex;gap:1.25rem;align-items:flex-start;margin-bottom:1.25rem;}
.calendar-main-card{flex:1;padding:0;overflow:hidden;}
.calendar-sidebar{flex:0 0 280px;display:flex;flex-direction:column;gap:.8rem;}
.calendar-header-bar{display:grid;grid-template-columns:auto 1fr auto;align-items:center;padding:.8rem 1.2rem;background:rgba(0,0,0,.2);border-bottom:1px solid var(--border);}
.calendar-header-bar h2{margin:0;font-size:1.2rem;text-align:center;}
.btn-icon{background:transparent;border:none;color:var(--muted);cursor:pointer;font-size:.9rem;padding:.4rem;border-radius:50%;}
.btn-icon:hover{background:rgba(255,255,255,.05);color:#fff;}
.calendar-grid-expressive{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;background:rgba(255,255,255,.03);padding:2px;}
.calendar-grid-expressive .calendar-weekday{background:#111827;color:var(--muted);text-align:center;padding:.6rem;font-size:.68rem;font-weight:700;text-transform:uppercase;}
.calendar-cell{background:#1f2937;min-height:85px;padding:.6rem;display:flex;flex-direction:column;gap:.4rem;cursor:pointer;border-left:3px solid transparent;border-radius:4px;}
.calendar-cell:not(.empty):hover{background:#374151;}
.uefa-cups-grid{display:grid;grid-template-columns:repeat(3,minmax(180px,1fr));gap:.85rem;margin-bottom:1rem;}
.uefa-cup-card{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:1rem;min-height:126px;background:#111827;}
.uefa-cup-card::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 80% 10%,rgba(255,255,255,.24),transparent 34%);pointer-events:none;}
.uefa-cup-card.ucl{background:linear-gradient(135deg,#132a72,#081331 62%,#111827);}
.uefa-cup-card.uel{background:linear-gradient(135deg,#a94705,#2a1208 62%,#111827);}
.uefa-cup-card.uecl{background:linear-gradient(135deg,#0f7a45,#082416 62%,#111827);}
.uefa-cup-kicker{font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.62);font-weight:800;}
.uefa-cup-name{font-size:1.05rem;font-weight:900;color:#fff;margin:.25rem 0 .55rem;}
.uefa-cup-meta{font-size:.78rem;color:rgba(255,255,255,.72);line-height:1.45;max-width:75%;}
.uefa-cup-trophy{position:absolute;right:.8rem;bottom:.65rem;width:58px;height:72px;border-radius:28px 28px 10px 10px;border:3px solid rgba(255,255,255,.75);border-top-width:8px;opacity:.78;}
.uefa-cup-trophy::before,.uefa-cup-trophy::after{content:"";position:absolute;top:10px;width:20px;height:24px;border:3px solid rgba(255,255,255,.55);border-radius:50%;}
.uefa-cup-trophy::before{left:-20px;border-right:none;}.uefa-cup-trophy::after{right:-20px;border-left:none;}
.match-report-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;margin:.8rem 0 1rem;}
.match-report-stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:.5rem;text-align:center;}
.match-report-stat span{display:block;color:var(--muted);font-size:.68rem;text-transform:uppercase;font-weight:800;}
.match-report-stat strong{display:block;color:#fff;font-size:1rem;margin-top:.15rem;}
.euro-standings-grid{display:grid;grid-template-columns:repeat(3,minmax(220px,1fr));gap:.9rem;}
.euro-table-card{border:1px solid var(--border);border-radius:10px;background:rgba(0,0,0,.18);overflow:hidden;}
.euro-table-card h3{margin:0;padding:.75rem .9rem;border-bottom:1px solid var(--border);font-size:1rem;}
.euro-table-card table{width:100%;border-collapse:collapse;font-size:.82rem;}
.euro-table-card td,.euro-table-card th{padding:.45rem .55rem;border-bottom:1px solid rgba(255,255,255,.05);text-align:left;}
.euro-table-card th{color:var(--muted);font-size:.68rem;text-transform:uppercase;}
.euro-table-card tr.highlight td{background:rgba(37,99,235,.18);color:#fff;font-weight:800;}
.live-match-running .bc-score-display{box-shadow:0 0 24px rgba(37,99,235,.45);}
@media(max-width:780px){.uefa-cups-grid,.euro-standings-grid{grid-template-columns:1fr;}.uefa-cup-meta{max-width:100%;padding-right:78px;}}
.calendar-cell.empty{background:#111827;cursor:default;opacity:.4;}
.calendar-cell.today{background:#172554;border:2px solid var(--primary);}
.calendar-cell.selected{box-shadow:inset 0 0 0 2px var(--accent-cyan);}
.calendar-cell.match{border-left-color:var(--primary);}
.calendar-cell.match.played{border-left-color:#4b5563;}
.calendar-cell.match.win{border-left-color:#10b981;background:rgba(16,185,129,.06);}
.calendar-cell.match.draw{border-left-color:#9ca3af;background:rgba(156,163,175,.06);}
.calendar-cell.match.loss{border-left-color:#ef4444;background:rgba(239,68,68,.06);}
.calendar-dayline{display:flex;justify-content:space-between;align-items:start;}
.calendar-date{font-size:1.1rem;font-weight:800;color:rgba(255,255,255,.3);line-height:1;}
.calendar-cell.today .calendar-date,.calendar-cell:hover .calendar-date{color:#fff;}
.calendar-tag{font-size:.62rem;font-weight:700;padding:2px 4px;border-radius:3px;background:rgba(0,0,0,.2);color:var(--muted);}
.calendar-cell.match .calendar-tag{background:rgba(59,130,246,.1);color:var(--primary-light);}
.calendar-opponent{font-size:.78rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.calendar-crest{width:14px;height:14px;vertical-align:middle;margin-right:3px;border-radius:50%;}
.calendar-subtext{font-size:.68rem;color:var(--muted);font-weight:600;}
.agenda-list-expressive{max-height:280px;overflow-y:auto;padding-right:.5rem;}
.calendar-agenda-item{background:rgba(255,255,255,.02);border-radius:8px;padding:.6rem;margin-bottom:.4rem;display:flex;justify-content:space-between;align-items:center;gap:.4rem;}
.calendar-agenda-item strong{font-size:.78rem;display:block;color:var(--primary-light);margin-bottom:2px;}
.calendar-agenda-item div{font-size:.8rem;color:#fff;}

.main-table-card{padding:0;overflow:hidden;}
.table-header-broad{padding:1.5rem 1.5rem .8rem;display:flex;justify-content:space-between;align-items:start;gap:1rem;flex-wrap:wrap;}
.th-left h1{margin:0 0 .4rem 0;font-size:1.5rem;}
.league-selector-dark{background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.1);color:#fff;border-radius:6px;padding:.4rem;font-size:.85rem;font-weight:700;cursor:pointer;}
.expressive-league-table{padding:0 1.5rem .8rem;}
.expressive-league-table table{width:100%;border-collapse:separate;border-spacing:0 2px;font-size:.9rem;}
.expressive-league-table th{color:var(--muted);text-transform:uppercase;font-size:.72rem;letter-spacing:.04em;padding:.8rem .6rem;text-align:left;background:#111827;position:sticky;top:0;}
.expressive-league-table td{padding:.8rem .65rem;color:var(--text);border-bottom:1px solid rgba(255,255,255,.01);}
.expressive-league-table tbody tr.highlight{background:rgba(59,130,246,.1);}
.expressive-league-table td:nth-child(10){font-weight:800;color:var(--primary-light);font-size:.95rem;}
.expressive-league-table .pos{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:5px;font-weight:800;font-size:.75rem;}
.expressive-league-table tr.pos-promo .pos{background:rgba(16,185,129,.15);color:#10b981;}
.expressive-league-table tr.pos-releg .pos{background:rgba(239,68,68,.15);color:#ef4444;}
.expressive-league-table tr.pos-promo td:first-child::before { content:'+ '; font-size:.6rem; }
.expressive-league-table tr.pos-releg td:first-child::before { content:'- '; font-size:.6rem; }
.table-legend-expressive{padding:.6rem 1.5rem 1.2rem;display:flex;gap:1.2rem;font-size:.78rem;color:var(--muted);border-top:1px solid rgba(255,255,255,.03);}
.leg-box{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:.4rem;vertical-align:middle;}
.leg-box.promo{background:#10b981;}
.leg-box.playoff{background:#f59e0b;}
.leg-box.releg{background:#ef4444;}
.zone-chip{display:inline-flex;align-items:center;gap:.25rem;border-radius:6px;padding:.22rem .48rem;font-size:.68rem;font-weight:900;white-space:nowrap;border:1px solid rgba(255,255,255,.12);}
.zone-ucl{background:rgba(59,130,246,.14);color:#93c5fd;}
.zone-uel{background:rgba(249,115,22,.14);color:#fdba74;}
.zone-uecl{background:rgba(34,197,94,.14);color:#86efac;}
.zone-promo{background:rgba(16,185,129,.14);color:#6ee7b7;}
.zone-playoff{background:rgba(245,158,11,.14);color:#fcd34d;}
.zone-releg{background:rgba(239,68,68,.14);color:#fca5a5;}

.grid-4{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:.8rem;}

.match-day-big-card{position:relative;padding:0;min-height:360px;}
.stadium-visual-bg{position:absolute;top:0;left:0;width:100%;height:100%;background:#0a2e15;opacity:.4;z-index:0;}
.card-content-relative{position:relative;z-index:10;padding:1.5rem;}
.match-broadcast-header{display:flex;align-items:center;gap:.8rem;margin-bottom:1.5rem;border-bottom:1px solid rgba(255,255,255,.05);padding-bottom:.8rem;}
.broad-live{background:#ef4444;color:#fff;font-weight:900;font-size:.75rem;padding:.35rem .8rem;border-radius:5px;}
.broad-info h2{margin:0;font-size:1.3rem;}
.broad-info p{margin:0;color:var(--muted);font-size:.85rem;}
.match-teams-broadcast{display:flex;align-items:center;justify-content:center;gap:1.5rem;margin-bottom:2rem;}
.bc-team{display:flex;flex-direction:column;align-items:center;gap:.8rem;flex:0 0 160px;text-align:center;}
.bc-logo-wrap{width:80px;height:80px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:2.5rem;font-weight:900;color:#fff;}
.bc-team h3{font-size:1.1rem;margin:0;max-width:160px;}
.bc-score-wrap{display:flex;flex-direction:column;align-items:center;gap:.4rem;}

.bc-time{font-family:monospace;font-size:1rem;color:#fbbf24;font-weight:700;}
.match-controls-bar{display:flex;justify-content:center;gap:.8rem;margin-bottom:1.5rem;}
.stop-btn{background:#dc2626!important;color:#fff!important;}
.console-head{background:#111827;padding:.4rem .8rem;color:var(--muted);font-size:.72rem;font-weight:700;border-bottom:1px solid var(--border);}
.match-log-console{background:#080a0f;border:1px solid var(--border);border-radius:8px;overflow:hidden;}
.console-body{max-height:150px;overflow-y:auto;padding:.8rem;font-family:Consolas,monospace;font-size:.78rem;color:#a1a1aa;line-height:1.5;}
.console-body div{margin-bottom:.3rem;padding-bottom:.3rem;border-bottom:1px solid rgba(255,255,255,.02);}
.console-body div:first-child{color:#fff;font-weight:700;}

.transfer-center-card{padding:0;overflow:hidden;}
.card-header-broad{padding:1.5rem 1.5rem .8rem;display:flex;justify-content:space-between;align-items:center;}
.card-header-broad h1{margin:0;font-size:1.5rem;}
.finance-display-row{display:flex;gap:.8rem;padding:0 1.5rem;margin-bottom:1.5rem;}
.fin-card{flex:1;background:rgba(17,24,39,.8);border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:.8rem;display:flex;align-items:center;gap:.8rem;}
.fin-icon{font-size:1.3rem;color:var(--muted);width:36px;text-align:center;}
.fin-info p{margin:0;font-size:.72rem;color:var(--muted);text-transform:uppercase;font-weight:700;}
.fin-info h2{margin:0;font-size:1.2rem;font-weight:800;color:#fff;}
.fin-card.budget h2{color:#fbbf24;}
.search-and-filter-bar{padding:1rem 1.5rem;display:flex;flex-direction:column;gap:.8rem;}
.search-input-wrap{position:relative;}
.search-input-wrap input{width:100%;background:#1f2937;border:1px solid #374151;color:#fff;border-radius:8px;padding:.65rem .8rem;font-size:.85rem;}
.search-input-wrap input:focus{border-color:var(--primary);outline:none;}
.filters-row{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;}
.filters-row select,.filters-row input{background:#1f2937;border:1px solid #374151;color:#fff;border-radius:6px;padding:.5rem;font-size:.78rem;}
.position-quick-filters{display:flex;gap:.3rem;flex-wrap:wrap;justify-content:center;padding-top:.8rem;border-top:1px solid rgba(255,255,255,.05);}
.cascade-filter-row{display:flex;align-items:flex-end;gap:.5rem;flex-wrap:wrap;}
.cascade-filter-group{flex:1;min-width:140px;display:flex;flex-direction:column;gap:.25rem;}
.cascade-filter-group label{font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;display:flex;align-items:center;gap:.3rem;}
.cascade-filter-group label i{font-size:.75rem;color:var(--primary-light);}
.cascade-filter-group select{background:#1f2937;border:1px solid #374151;color:#fff;border-radius:8px;padding:.55rem .7rem;font-size:.82rem;font-weight:600;cursor:pointer;transition:border-color .15s;}
.cascade-filter-group select:focus{border-color:var(--primary);outline:none;}
.cascade-arrow{color:var(--muted);font-size:1.1rem;padding-bottom:.3rem;flex-shrink:0;}
/* --- NOWE KARTY TRANSFEROWE --- */
.tc-card{
  background:var(--card);border:1px solid var(--border);border-radius:14px;
  padding:1.1rem;display:flex;flex-direction:column;gap:.75rem;
  transition:border-color .2s,box-shadow .2s;
}
.tc-card:hover{border-color:rgba(96,165,250,.35);box-shadow:0 6px 20px rgba(0,0,0,.4);}
.tc-card-top{display:flex;align-items:center;gap:.85rem;}
.tc-photo{width:54px;height:54px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid rgba(255,255,255,.1);}
.tc-photo-fallback{display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;color:#fff;}
.tc-card-info{flex:1;min-width:0;}
.tc-name{font-size:1rem;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tc-meta{display:flex;align-items:center;gap:.35rem;flex-wrap:wrap;margin:.2rem 0;}
.tc-pos-chip{font-size:.68rem;font-weight:800;padding:2px 7px;border-radius:5px;}
.tc-age{font-size:.75rem;color:var(--muted);}
.tc-flag{font-size:.72rem;color:var(--muted);}
.tc-club{font-size:.75rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tc-rating-col{flex-shrink:0;}
.tc-finance{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;}
.tc-fin-item{background:rgba(0,0,0,.25);border-radius:8px;padding:.5rem .7rem;}
.tc-fin-label{display:block;font-size:.65rem;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:.15rem;}
.tc-fin-val{font-size:.95rem;font-weight:800;}
.tc-fin-val.ok{color:#10b981;}
.tc-fin-val.bad{color:#ef4444;}
.tc-actions{display:flex;gap:.5rem;}
.tc-actions .btn{flex:1;justify-content:center;}
.tc-owned{text-align:center;font-size:.82rem;font-weight:700;color:#10b981;
  background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);border-radius:8px;padding:.5rem;}
.transfer-empty{text-align:center;padding:3rem;color:var(--muted);
  grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:.75rem;}
.transfer-msg.ok{background:rgba(16,185,129,.12);color:#10b981;border:1px solid rgba(16,185,129,.25);}
.transfer-msg.bad{background:rgba(239,68,68,.12);color:#ef4444;border:1px solid rgba(239,68,68,.25);}

/* WIększa siatka kart */
.transfer-grid-expressive{
  padding:0 1.25rem 1.5rem;
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
  gap:1rem;
}

.settings-grid-visual{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.8rem;margin-bottom:1.2rem;}
.setting-item-card{background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:10px;padding:1.2rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:.6rem;}
.setting-item-card .i-big{font-size:2rem;color:var(--primary);margin-bottom:.3rem;opacity:.7;}
.setting-item-card h3{margin:0;font-size:1rem;}
.setting-item-card p{margin:0 0 .6rem 0;font-size:.78rem;color:var(--muted);line-height:1.4;}
.setting-item-card .btn{width:100%;}
.sim-speed-box{display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:.8rem 1rem;flex-wrap:wrap;}
.sim-speed-box label{font-weight:700;color:#fff;display:flex;align-items:center;gap:.4rem;}
.sim-speed-box select{background:#1f2937;border:1px solid #374151;color:#fff;border-radius:6px;padding:.5rem;font-size:.82rem;cursor:pointer;}
.keybinds-flex{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:.6rem;}
.keybinds-flex div{background:rgba(255,255,255,.05);padding:.4rem .6rem;border-radius:6px;font-size:.78rem;color:var(--muted);}
kbd{background:#e1e1e1;color:#000;border-radius:3px;border:1px solid #b4b4b4;color:#333;display:inline-block;font-family:monospace;font-size:.75rem;font-weight:700;line-height:1;padding:2px 4px;margin:0 2px;}
.save-status-bar{padding:.4rem 1.5rem;color:var(--accent-cyan);font-size:.8rem;font-weight:700;text-align:center;}

.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;z-index:1000;}
.modal-overlay.active{display:flex;}
.modal-window{width:92%;max-width:480px;background:#111827;border:1px solid var(--border);border-radius:14px;padding:1.5rem;}

.loader-spinner{border:4px solid rgba(255,255,255,.1);border-left-color:#3b82f6;border-radius:50%;width:44px;height:44px;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-item{display:flex;align-items:center;gap:.5rem;font-size:.78rem;color:#6b7280;transition:color .3s;}
.loading-item.done{color:#34d399;}
.loading-item.active{color:#60a5fa;}
.loading-item .dot{width:7px;height:7px;border-radius:50%;background:#374151;flex-shrink:0;}
.loading-item.done .dot{background:#34d399;}
.loading-item.active .dot{background:#60a5fa;box-shadow:0 0 8px rgba(96,165,250,.5);}

.progress-bar-wrap{width:100%;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;}
.progress-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#06b6d4);border-radius:3px;transition:width .3s ease;}

.fi{vertical-align:middle;font-size:1.05em;}
.btn .fi{margin-right:3px;}

::-webkit-scrollbar{width:7px;height:7px;}
::-webkit-scrollbar-thumb{background:#374151;border-radius:4px;}
::-webkit-scrollbar-thumb:hover{background:#4b5563;}

.stats-card .stats-table{width:100%;border-collapse:collapse;font-size:.82rem;}
.stats-card .stats-table th{text-align:left;color:var(--muted);font-size:.68rem;text-transform:uppercase;padding:.5rem .4rem;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--card);z-index:1;}
.stats-card .stats-table td{padding:.45rem .4rem;border-bottom:1px solid rgba(255,255,255,.03);}
.stats-card .stats-table tr:hover td{background:rgba(255,255,255,.03);}
.stats-card .stats-table .num-col{width:28px;text-align:center;font-weight:700;color:var(--muted);font-size:.72rem;}
.stats-card .stats-table .goal-col{font-weight:800;color:var(--primary-light);font-size:.9rem;}
.stats-card .stats-table .assist-col{font-weight:800;color:#34d399;font-size:.9rem;}
.stats-card .stats-table .ga-col{font-weight:700;color:#fbbf24;}
.stats-card .stats-table .pos-badge{display:inline-block;padding:1px 6px;border-radius:4px;font-size:.65rem;font-weight:700;}

.player-tooltip{position:fixed;z-index:9999;pointer-events:none;width:280px;background:rgba(12,16,28,.96);border:1px solid var(--border);border-radius:14px;padding:1rem;backdrop-filter:blur(12px);box-shadow:0 12px 48px rgba(0,0,0,.7);}
.player-tooltip .pt-header{display:flex;align-items:center;gap:.75rem;margin-bottom:.7rem;}
.player-tooltip .pt-photo{width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.12);flex-shrink:0;}
.player-tooltip .pt-photo-fallback{display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;color:#fff;}
.player-tooltip .pt-name{font-weight:800;font-size:.95rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.player-tooltip .pt-meta{font-size:.72rem;color:var(--muted);}
.player-tooltip .pt-stats{display:grid;grid-template-columns:1fr 1fr;gap:.3rem .8rem;font-size:.78rem;}
.player-tooltip .pt-stats div{display:flex;justify-content:space-between;}
.player-tooltip .pt-stats div span:last-child{font-weight:700;color:#fff;}
.player-tooltip .pt-bar{margin-top:.5rem;}
.player-tooltip .pt-bar-label{display:flex;justify-content:space-between;font-size:.68rem;color:var(--muted);margin-bottom:.15rem;}
.player-tooltip .pt-bar-label span:last-child{font-weight:700;}
.player-tooltip .pt-bar-track{height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;}
.player-tooltip .pt-bar-fill{height:100%;border-radius:3px;transition:width .2s;}
.player-tooltip .pt-divider{border:none;border-top:1px solid rgba(255,255,255,.06);margin:.5rem 0;}

.squad-sort-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem;}
.squad-sort-bar h3{margin:0;}
.sort-chips{display:flex;gap:.3rem;flex-wrap:wrap;}
.sort-chips .btn{min-height:32px;padding:.3rem .65rem;font-size:.75rem;}
.sort-chips .btn.active{background:var(--primary);color:#fff;border-color:var(--primary);}

/* ZAKŁADKI TRANSFERÓW */
.transfer-tabs{display:flex;gap:.5rem;padding:0 1.5rem .75rem;border-bottom:1px solid var(--border);margin-bottom:.75rem;}
.transfer-tab{background:transparent;border:1px solid var(--border);color:var(--muted);padding:.65rem 1.2rem;border-radius:10px;font-weight:800;cursor:pointer;transition:.15s;font-size:.9rem;}
.transfer-tab.active{background:var(--primary);color:#fff;border-color:var(--primary);}
.transfer-result-count{font-size:.78rem;color:var(--muted);padding:0 1.5rem .5rem;}

/* LISTA SPRZEDAŻY */
.sale-list-container{padding:0 1.25rem 1.5rem;}
.sale-player-card{margin-bottom:1rem;}
.sale-offers-list{display:flex;flex-direction:column;gap:.4rem;}
.sale-offer-row{display:flex;align-items:center;justify-content:space-between;gap:.75rem;background:rgba(0,0,0,.2);border-radius:8px;padding:.6rem .8rem;border:1px solid var(--border);flex-wrap:wrap;}

@media(max-width:900px){
  .dashboard-content{flex-direction:column;}
  .calendar-layout-container{flex-direction:column;}
  .calendar-sidebar{flex:auto;}
  .finance-display-row{flex-direction:column;}
  .filters-row{grid-template-columns:1fr;}
  .cascade-filter-row{flex-direction:column;gap:.4rem;}
  .cascade-arrow{display:none;}
  .cascade-filter-group{min-width:100%;}
  .squad-bottom-grid{flex-direction:column;}
  .pitch-visual{min-height:380px;}
}
/* ---- TŁO KARIERY ---- */
#career-bg{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:#05080d;}
.cb-grid{position:absolute;inset:0;
  background:
    linear-gradient(to bottom,rgba(5,8,13,.18),rgba(5,8,13,.92) 72%),
    radial-gradient(ellipse at 50% 18%,rgba(226,232,240,.22),transparent 24%),
    linear-gradient(to bottom,#14213d 0 22%,#1f2937 22% 28%,#0b1220 28% 42%,#155e36 42% 100%);}
.cb-grid::before{content:"";position:absolute;left:-8%;right:-8%;top:24%;height:23%;
  background:repeating-linear-gradient(90deg,#dbeafe 0 16px,#1e3a8a 16px 28px,#f8fafc 28px 43px,#334155 43px 56px);
  transform:perspective(700px) rotateX(58deg);transform-origin:50% 100%;opacity:.18;}
.cb-grid::after{content:"";position:absolute;left:8%;right:8%;bottom:-6%;height:48%;
  background:
    linear-gradient(90deg,transparent 0 49.6%,rgba(255,255,255,.42) 49.6% 50.4%,transparent 50.4%),
    radial-gradient(ellipse at center,transparent 0 17%,rgba(255,255,255,.32) 17.4% 18%,transparent 18.4%),
    repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 1px,transparent 1px 54px),
    linear-gradient(#15803d,#166534);
  border:2px solid rgba(255,255,255,.24);transform:perspective(900px) rotateX(64deg);transform-origin:50% 100%;}
.cb-orb{display:none;}
.cb-scanline{position:absolute;inset:0;
  background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.06) 3px,rgba(0,0,0,.06) 4px);
  pointer-events:none;}
#cb-particles{position:absolute;inset:0;width:100%;height:100%;}
@keyframes orbFloat{
  0%,100%{transform:translate(0,0) scale(1);}
  33%{transform:translate(40px,-30px) scale(1.07);}
  66%{transform:translate(-25px,20px) scale(.95);}
}
  `;
  document.head.appendChild(s);
}

const LOADING_STEPS = [
  { id: 'init', label: 'Inicjalizacja danych' },
  { id: 'uefa', label: 'Ładowanie rankingu UEFA' },
  { id: 'fixtures', label: 'Generowanie terminarza' },
  { id: 'squad', label: 'Ustawianie składu' },
  { id: 'transfers', label: 'Ładowanie transferów' },
  { id: 'leagues', label: 'Ładowanie lig' },
  { id: 'tables', label: 'Generowanie tabel ligowych' },
  { id: 'render', label: 'Renderowanie interfejsu' },
  { id: 'done', label: 'Gotowe!' },
];

let _loadedStep = -1;

// getUefaForLeague, loadUefaData

function setLoadProgress(pct, msg, stepId){
  const lt=document.getElementById("loadingText");if(lt)lt.textContent=msg||"";
  const pf=document.getElementById("progressFill");if(pf)pf.style.width=Math.min(100,Math.max(0,pct))+"%";
  const glt=document.getElementById("globalLoadingText");if(glt)glt.textContent=msg||"";
  const gpf=document.getElementById("globalProgressFill");if(gpf)gpf.style.width=Math.min(100,Math.max(0,pct))+"%";

  if(stepId){
    const idx = LOADING_STEPS.findIndex(s => s.id === stepId);
    if(idx >= 0 && idx > _loadedStep){
      _loadedStep = idx;
      const counter = document.getElementById("globalProgressCounter");
      if(counter) counter.textContent = `${idx+1} / ${LOADING_STEPS.length}`;
      renderLoadingItems(idx);
    }
  }
}

function renderLoadingItems(activeIdx){
  const cont = document.getElementById("globalLoadingItems");
  if(!cont) return;
  cont.innerHTML = LOADING_STEPS.map((s, i) => {
    let cls = 'loading-item';
    if(i < activeIdx) cls += ' done';
    else if(i === activeIdx) cls += ' active';
    return `<div class="${cls}"><span class="dot"></span>${s.label}</div>`;
  }).join('');
}

function showGlobalLoading(){
  const el = document.getElementById("globalLoading");
  if(!el) return;
  _loadedStep = -1;
  el.style.display = 'flex';
  el.style.opacity = '1';
  const counter = document.getElementById("globalProgressCounter");
  if(counter) counter.textContent = `0 / ${LOADING_STEPS.length}`;
  renderLoadingItems(-1);
}

function hideGlobalLoading(){
  const el = document.getElementById("globalLoading");
  if(!el) return;
  el.style.opacity = '0';
  setTimeout(() => { el.style.display = 'none'; }, 400);
}
async function initCareer() {
    injectGameplayStyles();
    const loader=document.getElementById("loadingScreen");
    if(loader){loader.style.visibility="visible";loader.style.opacity="1";}
    const team=state.team;

    // === FAZA 1: szybka inicjalizacja (bez sieci) ===
    setLoadProgress(10,"Inicjalizacja danych...","init");
    state.players=team.players.map((p,i)=>enrichPlayer(p,i+1));
    state.formation="4-3-3";state.tactics={style:"balanced",pressing:"medium",width:"normal"};
    state.table=[];state.results=[];state.news=[];state.matchLog=[];
    state.currentDate=new Date(2025,6,1);state.calendarDate=new Date(2025,6,1);
    setLoadProgress(30,"Ładowanie rankingu UEFA...","uefa");
    try{await loadUefaData();}catch(e){}
    if (!state.uefaPoints || Object.keys(state.uefaPoints).length === 0) {
        state.uefaPoints = {};
        if (state.uefaData && state.uefaData.rankings) {
            state.uefaData.rankings.forEach(r => {
                state.uefaPoints[r.competition_code] = r.coefficient;
            });
        }
    }
    state.calendarTargetDate=null;state.seasonFinished=false;state.transferWindow=null;
    state.forSale=[];state.saleOffers=[];state.trainingFocus="balanced";state.trainingLog=[];
    const tier = getLeagueTier();
    const leagueBoost = tier.tier === 1 ? 2.0 : tier.tier === 2 ? 1.4 : tier.tier === 3 ? 1.0 : 0.7;
    state.budgetMillions = round2(Math.max(team.budget_millions, team.budget_millions * leagueBoost));
    state.wageBudgetMillions = round2(Math.max(1.5, state.budgetMillions * 0.55));
    addNews(`Liga: ${tier.label} (Tier ${tier.tier}) — Budżet startowy: €${formatMoney(state.budgetMillions)}M`);
    if(state.simTimer){clearTimeout(state.simTimer);state.simTimer=null;}
    state.simulating=false;state.simMode="none";
    state.lineup=[];state.bench=[];state.reserves=[];
    state.transferPlayers=[];state._transfersLoaded=false;state.allLeagueData=null;state._youthCnt=state._youthCnt||0;

    setLoadProgress(40,"Generowanie terminarza...","fixtures");
    state.europeanEntry=null;state.europeanOpponents=[];state.uclLeague=null;
    generateFixtures(2025);initTable();

    setLoadProgress(65,"Ustawianie składu...","squad");
    autoPick();

    setLoadProgress(85,"Renderowanie interfejsu...","render");
    renderFormationButtons();updateTacticsInputs();updateNav();
    addNews(`Trener ${state.coachName} obejmuje ${state.team.name}. Rozpoczyna sie nowy sezon!`);
    renderAll();

    // === UKRYJ LOADER — gra gotowa do użycia ===
    setLoadProgress(100,"Gotowe!","done");
    if(loader){
        setTimeout(()=>{
            loader.style.opacity="0";
            setTimeout(()=>{loader.style.visibility="hidden";loader.style.display="none";},350);
        },200);
    }
    hideGlobalLoading();

    // === FAZA 2: ładowanie danych w tle ===
    // Informacja w zakładce Transfery
    const transferList=document.getElementById("transferList");
    if(transferList) transferList.innerHTML=`<div class="transfer-card" style="text-align:center;padding:2rem;"><div class="loader-spinner" style="margin:0 auto;"></div><div style="margin-top:1rem;color:var(--muted);">Ładowanie transferów...</div></div>`;

    prepareTransferPool()
      .then(()=>{fillTransferFilterOptions();renderTransfers();})
      .catch(()=>{if(transferList)transferList.innerHTML=`<div class="transfer-card"><div class="player-name">Błąd ładowania transferów</div></div>`;});

    loadAllLeagues()
      .then(d=>{
        state.allLeagueData=d;
        initAllLeagueTables();
        generateAllLeagueFixtures(2025);
        fillLeagueTableSelector();
        renderTable();
        renderOtherLeaguePreviews();
      })
      .catch(()=>{});
}

function enrichPlayer(player,id) {
    const mv = player.market_value_eur||0;
    return {...player,id,valueMillions:round2(Math.max(0.1,mv/1e6)),wageMillions:round2(Math.max(0.04,(mv>0?mv:3e5)/1e6*0.07)),fitness:96,morale:82,goals:0,assists:0,matches:0,
        contractYears: player.contractYears || rand(1,4),
        yellowCards: 0, redCards: 0, suspended: false};
}

function generateFixtures(startYear) {
    const ids = state.allTeams.map((c)=>c.club_id);
    let r = [...ids];
    if (r.length%2!==0) r.push("BYE");
    const rounds=[], half=r.length/2;
    for (let rd=1;rd<r.length;rd+=1){
        const rf=[];
        for(let i=0;i<half;i+=1){
            let h=r[i],a=r[r.length-1-i];
            if(h!=="BYE"&&a!=="BYE"){
                if(rd%2===0)[h,a]=[a,h];
                rf.push({homeClubId:h,awayClubId:a,round:rd});
            }
        }
        rounds.push(rf); r=[r[0],r[r.length-1],...r.slice(1,-1)];
    }
    const rev=rounds.map((r,i)=>r.map((f)=>({homeClubId:f.awayClubId,awayClubId:f.homeClubId,round:rounds.length+i+1})));
    const all=[...rounds,...rev];
    const totalRounds = all.length;
    const firstMatch = new Date(startYear, 7, 2);
    snapToMatchDay(firstMatch);
    const lastDeadline = new Date(startYear + 1, 4, 31);
    const msAvail = lastDeadline - firstMatch;
    const winterMs = 28 * 24 * 60 * 60 * 1000;
    const effectiveDays = Math.max(1, (msAvail - winterMs) / (24 * 60 * 60 * 1000));
    const gapDays = Math.max(1, Math.floor(effectiveDays / totalRounds));
    const fixtures=[];
    let cur = new Date(firstMatch);
    all.forEach((rf)=>{
        if(cur.getMonth()===11&&cur.getDate()>10) cur=new Date(cur.getFullYear()+1,0,1);
        snapToMatchDay(cur);
        if (cur > lastDeadline) cur = new Date(lastDeadline);
        rf.forEach((f)=>{
            fixtures.push({id:`${f.round}-${f.homeClubId}-${f.awayClubId}`,competition:"league",round:f.round,date:toIsoDate(cur),homeClubId:f.homeClubId,awayClubId:f.awayClubId,played:false,homeGoals:null,awayGoals:null});
        });
        cur.setDate(cur.getDate() + gapDays);
    });
    
    // Wyczyść WSZYSTKIE stare mecze europejskie przed generowaniem nowych
    const euroCodes = Object.keys(UEFA_CUPS);
    state.fixtures = fixtures.filter(f => !euroCodes.includes(f.competition));
    
    generateEuropeanFixtures(startYear);
}

// === UEFA Mechanics ===
// Zaktualizowane do formatu sezonu 2024/2025
// Zaleznosci: state, getClub, escapeHtml, clubCrestHtml, pushForm,
//   toIsoDate, fromIsoDate, shuffle, rand, apiGet, addNews

const FORM_ICON = window.FORM_ICON = {W:'<span style="color:#10b981;font-weight:800;">W</span>',D:'<span style="color:#9ca3af;font-weight:800;">R</span>',L:'<span style="color:#ef4444;font-weight:800;">P</span>'};
const UEFA_CUPS = window.UEFA_CUPS = {
    UCL: { short:"LM", name:"Liga Mistrzow", className:"ucl", color:"#3b82f6", groupLabel:"Faza ligowa", matches:8 },
    UEL: { short:"LE", name:"Liga Europy", className:"uel", color:"#f97316", groupLabel:"Faza ligowa", matches:8 },
    UECL:{ short:"LK", name:"Liga Konferencji", className:"uecl", color:"#22c55e", groupLabel:"Faza ligowa", matches:6 },
};
const UEFA_CODE_ALIASES = { L1:"DE1", C1:"CH1", KR1:"HR1", ZYP1:"CY1", UNG1:"HU1", SL1:"SI1", SLO1:"SK1", KAS1:"KZ1", BOS1:"BA1", LET1:"LV1", MAZ1:"MK1", NIR1:"NI1", EST1:"EE1", MO1N:"MD1", MNE1:"ME1", GE1N:"GE1", LUX1:"LU1", SMR1:"SM1" };

function getUefaForLeague(code) {
    if (!state.uefaData) return null;
    const key = String(code || "").toUpperCase();
    const alias = UEFA_CODE_ALIASES[key] || key;
    const entry = state.uefaData.rankings?.find(r => r.competition_code === key || r.competition_code === alias);
    return entry || null;
}

async function loadUefaData() {
    try { const data = await apiGet("/api/uefa"); state.uefaData = data; }
    catch (e) { state.uefaData = null; }
}

function generateEuropeanFixtures(startYear){
    if(!state.europeanEntry) return;
    const code = state.europeanEntry.code;
    const cup = UEFA_CUPS[code];
    if(!cup) return;
    state.fixtures = state.fixtures.filter(f => f.competition !== code);
    state.europeanGroup = null;
    state.europeanOpponents = [];
    if(code === 'UCL'){
        state.uclLeague = null; state.uelLeague = null; state.ueclLeague = null;
        state.uclKnockout = null; state.uelKnockout = null; state.ueclKnockout = null;
        generateUclLeaguePhase(startYear);
    } else if(code === 'UEL'){
        state.uclLeague = null; state.uelLeague = null; state.ueclLeague = null;
        state.uclKnockout = null; state.uelKnockout = null; state.ueclKnockout = null;
        generateUelLeaguePhase(startYear);
    } else if(code === 'UECL'){
        state.uclLeague = null; state.uelLeague = null; state.ueclLeague = null;
        state.uclKnockout = null; state.uelKnockout = null; state.ueclKnockout = null;
        generateUeclLeaguePhase(startYear);
    }
}

function buildEuropeanLeagueTeams(cupCode, directCount, qualCount){
    const directSpots = getCupDirectSpots(cupCode, directCount);
    const teams = []; const usedIds = new Set();
    if(state.allLeagueData){
        for(const [code, n] of Object.entries(directSpots)){
            const league = state.allLeagueData[code];
            if(!league?.clubs) continue;
            const sorted = [...league.clubs].sort((a,b) => (b.avg_rating||0)-(a.avg_rating||0));
            let added = 0;
            for(const c of sorted){
                if(added >= n) break;
                const id = String(c.club_id);
                if(usedIds.has(id)) continue;
                usedIds.add(id);
                teams.push({...c, qualType:'direct', qualFrom:code});
                added++;
            }
        }
    }
    const usedCodes = new Set(Object.keys(directSpots));
    const qualTeams = [];
    if(state.uefaData?.rankings && state.allLeagueData){
        const avail = state.uefaData.rankings.filter(r => !usedCodes.has(r.competition_code)).sort((a,b) => b.rank - a.rank);
        for(const r of avail){
            if(qualTeams.length >= qualCount) break;
            const league = state.allLeagueData[r.competition_code];
            if(!league?.clubs?.length) continue;
            const top = [...league.clubs].sort((a,b) => (b.avg_rating||0)-(a.avg_rating||0))[0];
            if(!top || usedIds.has(String(top.club_id))) continue;
            usedIds.add(String(top.club_id));
            qualTeams.push({...top, qualType:'qualifier', qualFrom:r.competition_code});
        }
    }
    while(qualTeams.length < qualCount){
        const n = teams.length + qualTeams.length + 1;
        const hue = rand(0, 360);
        qualTeams.push({
            club_id: cupCode + '-Q' + n, name: 'Kwalifikant ' + n,
            color: 'hsl(' + hue + ' 70% 48%)', logo_url: '',
            avg_rating: cupCode==='UCL' ? 62+rand(0,5) : cupCode==='UEL' ? 60+rand(0,5) : 58+rand(0,5),
            qualType: 'qualifier', qualFrom: 'N/A'
        });
    }
    return [...teams, ...qualTeams.slice(0, qualCount)];
}

function getCupDirectSpots(cupCode, maxTotal){
    if(!state.uefaData?.rankings) return {};
    const spots = {}; let total = 0;
    const ranked = [...state.uefaData.rankings].sort((a,b) => a.rank - b.rank);
    for(const r of ranked){
        if(total >= maxTotal) break;
        let ls = 0;
        if(cupCode === 'UCL'){ if(r.rank <= 4) ls = 4; else if(r.rank <= 6) ls = 2; else if(r.rank <= 15) ls = 1; }
        else if(cupCode === 'UEL'){ if(r.rank <= 5) ls = 2; else if(r.rank <= 15) ls = 1; }
        else { if(r.rank <= 10) ls = 1; }
        if(ls > 0){ ls = Math.min(ls, maxTotal - total); spots[r.competition_code] = ls; total += ls; }
    }
    return spots;
}

function generateSwissLeagueFixtures(allTeams, cupCode, matchCount, dates, startYear){
    if(allTeams.length < 2) return [];
    const n = allTeams.length;
    const ids = allTeams.map(t => String(t.club_id));
    let arr = [...ids]; const rounds = [];
    for(let r = 0; r < matchCount; r++){
        const matches = [];
        for(let i = 0; i < Math.floor(n/2); i++){
            let home = arr[i], away = arr[n-1-i];
            if(r % 2 === 1) [home, away] = [away, home];
            matches.push({homeClubId: home, awayClubId: away});
        }
        rounds.push(matches);
        const last = arr.pop(); arr.splice(1, 0, last);
    }
    const isoDates = dates.map(([y,m,d]) => toIsoDate(new Date(startYear+y, m, d)));
    const fixtures = [];
    rounds.forEach((rm, ri) => {
        const date = isoDates[ri];
        rm.forEach(m => {
            fixtures.push({
                id: cupCode + '-L' + (ri+1) + '-' + m.homeClubId + '-' + m.awayClubId,
                competition: cupCode, round: ri + 1,
                stage: 'Faza ligowa — Kolejka ' + (ri+1),
                date: date, homeClubId: m.homeClubId, awayClubId: m.awayClubId,
                played: false, homeGoals: null, awayGoals: null
            });
        });
    });
    return fixtures;
}

function initSwissLeagueState(allTeams, cupCode, fixtures){
    return {
        teams: allTeams.map(t => ({
            club_id: String(t.club_id), name: t.name,
            color: t.color || '#3b82f6', logo_url: t.logo_url || '',
            avg_rating: t.avg_rating || 70, qualType: t.qualType,
            qualFrom: t.qualFrom || '', played: 0, won: 0, drawn: 0, lost: 0,
            gf: 0, ga: 0, points: 0, form: []
        })), fixtures: fixtures
    };
}

const UCL_LEAGUE_DATES = [[0,8,17],[0,9,1],[0,9,22],[0,10,5],[0,10,26],[0,11,10],[0,11,18],[1,0,21]];
const UEL_LEAGUE_DATES = [[0,8,24],[0,9,8],[0,9,29],[0,10,12],[0,10,26],[0,11,9],[0,11,23],[1,0,28]];
const UECL_LEAGUE_DATES = [[0,9,3],[0,9,24],[0,10,8],[0,10,22],[0,11,5],[0,11,26]];
const UCL_KNOCKOUT_DATES = {po1:[1,1,11],po2:[1,1,18],r16_1:[1,2,4],r16_2:[1,2,11],qf_1:[1,3,1],qf_2:[1,3,8],sf_1:[1,3,29],sf_2:[1,4,6],final:[1,4,30]};
const UEL_KNOCKOUT_DATES = {po1:[1,1,14],po2:[1,1,21],r16_1:[1,2,7],r16_2:[1,2,14],qf_1:[1,3,4],qf_2:[1,3,11],sf_1:[1,4,1],sf_2:[1,4,8],final:[1,4,22]};
const UECL_KNOCKOUT_DATES = {po1:[1,1,15],po2:[1,1,22],r16_1:[1,2,13],r16_2:[1,2,20],qf_1:[1,3,12],qf_2:[1,3,19],sf_1:[1,4,9],sf_2:[1,4,16],final:[1,4,28]};

function buildUclLeagueTeams(){return buildEuropeanLeagueTeams('UCL', 29, 7);}
function generateUclLeaguePhase(startYear){
    const allTeams = buildUclLeagueTeams();
    const fixtures = generateSwissLeagueFixtures(allTeams, 'UCL', 8, UCL_LEAGUE_DATES, startYear);
    state.uclLeague = initSwissLeagueState(allTeams, 'UCL', fixtures);
    state.uclKnockout = null;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}

function buildUelLeagueTeams(){return buildEuropeanLeagueTeams('UEL', 29, 7);}
function generateUelLeaguePhase(startYear){
    const allTeams = buildUelLeagueTeams();
    const fixtures = generateSwissLeagueFixtures(allTeams, 'UEL', 8, UEL_LEAGUE_DATES, startYear);
    state.uelLeague = initSwissLeagueState(allTeams, 'UEL', fixtures);
    state.uelKnockout = null;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}

function buildUeclLeagueTeams(){return buildEuropeanLeagueTeams('UECL', 29, 7);}
function generateUeclLeaguePhase(startYear){
    const allTeams = buildUeclLeagueTeams();
    const fixtures = generateSwissLeagueFixtures(allTeams, 'UECL', 6, UECL_LEAGUE_DATES, startYear);
    state.ueclLeague = initSwissLeagueState(allTeams, 'UECL', fixtures);
    state.ueclKnockout = null;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}

// === Tabele systemu szwajcarskiego ===
function buildSwissLeagueTable(leagueData, cupCode){
    if(!leagueData) return [];
    const rows = leagueData.teams.map(t => ({...t}));
    const map = new Map(rows.map(r => [r.club_id, r]));
    (state.fixtures||[]).filter(f => f.competition === cupCode && f.stage?.startsWith('Faza ligowa') && f.played).forEach(f => {
        const h = map.get(String(f.homeClubId));
        const a = map.get(String(f.awayClubId));
        if(!h || !a) return;
        h.played++; a.played++;
        h.gf += f.homeGoals; h.ga += f.awayGoals;
        a.gf += f.awayGoals; a.ga += f.homeGoals;
        if(f.homeGoals > f.awayGoals){h.won++; h.points += 3; a.lost++; pushForm(h,"W"); pushForm(a,"L");}
        else if(f.homeGoals < f.awayGoals){a.won++; a.points += 3; h.lost++; pushForm(a,"W"); pushForm(h,"L");}
        else{h.drawn++; a.drawn++; h.points++; a.points++; pushForm(h,"D"); pushForm(a,"D");}
    });
    return rows.sort((a,b) => {
        if(b.points !== a.points) return b.points - a.points;
        const gdA = a.gf - a.ga, gdB = b.gf - b.ga;
        if(gdB !== gdA) return gdB - gdA;
        if(b.gf !== a.gf) return b.gf - a.gf;
        const awayA = Math.floor(a.gf * 0.5), awayB = Math.floor(b.gf * 0.5);
        if(awayB !== awayA) return awayB - awayA;
        return a.name.localeCompare(b.name, "pl");
    });
}
function buildUclLeagueTable(){return buildSwissLeagueTable(state.uclLeague, 'UCL');}
function buildUelLeagueTable(){return buildSwissLeagueTable(state.uelLeague, 'UEL');}
function buildUeclLeagueTable(){return buildSwissLeagueTable(state.ueclLeague, 'UECL');}

function knockoutTeamName(id, leagueData){
    if(!id) return '?';
    if(leagueData){const t = leagueData.teams.find(t => String(t.club_id) === String(id)); if(t) return t.name;}
    const c = getClub(id); return c?.name || '?';
}
function knockoutTeamLogo(id, leagueData){
    if(!id) return '';
    if(leagueData){const t = leagueData.teams.find(t => String(t.club_id) === String(id)); if(t) return t.logo_url || '';}
    const c = getClub(id); return c?.logo_url || '';
}
function knockoutTeamColor(id, leagueData){
    if(!id) return '#3b82f6';
    if(leagueData){const t = leagueData.teams.find(t => String(t.club_id) === String(id)); if(t) return t.color || '#3b82f6';}
    const c = getClub(id); return c?.color || '#3b82f6';
}

// === Generator faz pucharowych ===
function generateKnockoutPhase(leagueTable, cupCode, knockoutDates, startYear){
    if(!leagueTable || leagueTable.length === 0) return null;
    const topTeams = leagueTable.slice(0, 24);
    const pairs = [];
    for(let i = 8; i < 16 && i < topTeams.length; i++){
        const awayIdx = Math.min(topTeams.length - 1 - (i - 8), topTeams.length - 1);
        if(awayIdx > i) pairs.push({home: topTeams[i], away: topTeams[awayIdx]});
    }
    const kd = {};
    for(const [k,v] of Object.entries(knockoutDates)){ kd[k] = toIsoDate(new Date(startYear + v[0], v[1], v[2])); }
    const fixtures = [];
    const playoffs = pairs.map((p,i) => {
        fixtures.push({id: cupCode + '-PO' + (i+1) + '-L1', competition: cupCode, round: 9, stage: 'Playoff - 1. mecz', date: kd.po1, homeClubId: p.home.club_id, awayClubId: p.away.club_id, played: false, homeGoals: null, awayGoals: null});
        fixtures.push({id: cupCode + '-PO' + (i+1) + '-L2', competition: cupCode, round: 10, stage: 'Playoff - 2. mecz', date: kd.po2, homeClubId: p.away.club_id, awayClubId: p.home.club_id, played: false, homeGoals: null, awayGoals: null});
        return { home: p.home.club_id, away: p.away.club_id, homeName: p.home.name, awayName: p.away.name, leg1: [null,null], leg2: [null,null], winner: null };
    });
    return {
        generated: true, playoffsPending: true, r16Pending: false, qfPending: false, sfPending: false,
        dates: kd, playoffs,
        r16: Array(8).fill(null).map(() => ({home:null,away:null,homeName:'?',awayName:'?',leg1:[null,null],leg2:[null,null],winner:null})),
        qf: Array(4).fill(null).map(() => ({home:null,away:null,homeName:'?',awayName:'?',leg1:[null,null],leg2:[null,null],winner:null})),
        sf: Array(2).fill(null).map(() => ({home:null,away:null,homeName:'?',awayName:'?',leg1:[null,null],leg2:[null,null],winner:null})),
        final: {home:null,away:null,homeGoals:null,awayGoals:null,winner:null},
        _fixtures: fixtures
    };
}

function checkAndGenerateKnockout(leagueData, knockoutState, tableBuilder, cupCode, knockoutDates, startYear){
    if(!leagueData || !knockoutState || knockoutState.generated) return false;
    const leagueFx = leagueData.fixtures;
    if(!leagueFx || !leagueFx.every(f => f.played)) return false;
    const tbl = tableBuilder();
    const newState = generateKnockoutPhase(tbl, cupCode, knockoutDates, startYear);
    if(newState){
        Object.assign(knockoutState, newState);
        state.fixtures = [...state.fixtures, ...newState._fixtures].sort((a,b) => a.date.localeCompare(b.date));
        delete knockoutState._fixtures;
        return true;
    }
    return false;
}

function _resolveKnockoutTie(fx, ko, cupPrefix, leagueData){
    const resolve = (arr) => {
        for(const tie of arr){
            if(tie.winner) continue;
            if(tie.leg1[0] === null || tie.leg2[0] === null) continue;
            const aggH = tie.leg1[0] + tie.leg2[1];
            const aggA = tie.leg1[1] + tie.leg2[0];
            tie.winner = aggH >= aggA ? tie.home : tie.away;
        }
    };
    const fxId = fx.id || '';
    if(fxId.startsWith(cupPrefix + '-PO')){
        const m = fxId.match(new RegExp(cupPrefix + '-PO(\\d+)'));
        const i = m ? parseInt(m[1]) - 1 : -1;
        if(i >= 0 && i < ko.playoffs.length){
            const tie = ko.playoffs[i];
            if(fx.stage?.includes('1.')) tie.leg1 = [fx.homeGoals, fx.awayGoals]; else tie.leg2 = [fx.homeGoals, fx.awayGoals];
            resolve(ko.playoffs);
        }
    }
    if(fxId.startsWith(cupPrefix + '-R16')){
        const m = fxId.match(new RegExp(cupPrefix + '-R16-(\\d+)'));
        const i = m ? parseInt(m[1]) - 1 : -1;
        if(i >= 0 && i < ko.r16.length){
            const tie = ko.r16[i];
            if(fx.stage?.includes('1.')) tie.leg1 = [fx.homeGoals, fx.awayGoals]; else tie.leg2 = [fx.homeGoals, fx.awayGoals];
            resolve(ko.r16);
        }
    }
    if(fxId.startsWith(cupPrefix + '-QF')){
        const m = fxId.match(new RegExp(cupPrefix + '-QF-(\\d+)'));
        const i = m ? parseInt(m[1]) - 1 : -1;
        if(i >= 0 && i < ko.qf.length){
            const tie = ko.qf[i];
            if(fx.stage?.includes('1.')) tie.leg1 = [fx.homeGoals, fx.awayGoals]; else tie.leg2 = [fx.homeGoals, fx.awayGoals];
            resolve(ko.qf);
        }
    }
    if(fxId.startsWith(cupPrefix + '-SF')){
        const m = fxId.match(new RegExp(cupPrefix + '-SF-(\\d+)'));
        const i = m ? parseInt(m[1]) - 1 : -1;
        if(i >= 0 && i < ko.sf.length){
            const tie = ko.sf[i];
            if(fx.stage?.includes('1.')) tie.leg1 = [fx.homeGoals, fx.awayGoals]; else tie.leg2 = [fx.homeGoals, fx.awayGoals];
            resolve(ko.sf);
        }
    }
    if(fxId === cupPrefix + '-FINAL'){
        ko.final.homeGoals = fx.homeGoals; ko.final.awayGoals = fx.awayGoals;
        ko.final.winner = fx.homeGoals >= fx.awayGoals ? ko.final.home : ko.final.away;
    }
}

// === UCL Knockout ===
function checkAndGenerateUclKnockout(){
    if(!state.uclLeague) return;
    if(!state.uclKnockout){ state.uclKnockout = {}; }
    const ko = state.uclKnockout;
    const year = parseInt(state.fixtures[0]?.date?.split('-')[0]) || 2025;
    if(!ko.generated){
        checkAndGenerateKnockout(state.uclLeague, ko, buildUclLeagueTable, 'UCL', UCL_KNOCKOUT_DATES, year);
        return;
    }
    if(ko.playoffsPending && ko.playoffs.every(t => t.winner)){ ko.playoffsPending = false; _generateUclR16(ko, year); return; }
    if(ko.r16Pending && ko.r16.every(t => t.winner)){ ko.r16Pending = false; _generateUclQF(ko, year); return; }
    if(ko.qfPending && ko.qf.every(t => t.winner)){ ko.qfPending = false; _generateUclSF(ko, year); return; }
    if(ko.sfPending && ko.sf.every(t => t.winner)){ ko.sfPending = false; _generateUclFinal(ko, year); return; }
}
function _generateUclR16(ko, year){
    const tbl = buildUclLeagueTable(); const kd = ko.dates; const fixtures = [];
    const top8 = tbl.slice(0, 8); const poWinners = ko.playoffs.map(t => t.winner);
    ko.r16 = [];
    for(let i = 0; i < 8; i++){
        const h = top8[i], a = poWinners[7-i];
        ko.r16.push({ home: h?.club_id || h, away: a, homeName: knockoutTeamName(h?.club_id || h, state.uclLeague), awayName: knockoutTeamName(a, state.uclLeague), leg1:[null,null], leg2:[null,null], winner:null });
    }
    ko.r16.forEach((t,i) => {
        fixtures.push({id:'UCL-R16-'+(i+1)+'-L1', competition:'UCL', round:11, stage:'1/8 finału — 1. mecz', date:kd.r16_1, homeClubId:t.home, awayClubId:t.away, played:false, homeGoals:null, awayGoals:null});
        fixtures.push({id:'UCL-R16-'+(i+1)+'-L2', competition:'UCL', round:12, stage:'1/8 finału — 2. mecz', date:kd.r16_2, homeClubId:t.away, awayClubId:t.home, played:false, homeGoals:null, awayGoals:null});
    });
    ko.r16Pending = true;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}
function _generateUclQF(ko, year){
    const kd = ko.dates; const fixtures = []; const w = ko.r16.map(t => t.winner);
    ko.qf = [[w[0],w[1]],[w[2],w[3]],[w[4],w[5]],[w[6],w[7]]].map(([h,a]) => ({ home:h, away:a, homeName:knockoutTeamName(h, state.uclLeague), awayName:knockoutTeamName(a, state.uclLeague), leg1:[null,null], leg2:[null,null], winner:null }));
    ko.qf.forEach((t,i) => {
        fixtures.push({id:'UCL-QF-'+(i+1)+'-L1', competition:'UCL', round:13, stage:'1/4 finału — 1. mecz', date:kd.qf_1, homeClubId:t.home, awayClubId:t.away, played:false, homeGoals:null, awayGoals:null});
        fixtures.push({id:'UCL-QF-'+(i+1)+'-L2', competition:'UCL', round:14, stage:'1/4 finału — 2. mecz', date:kd.qf_2, homeClubId:t.away, awayClubId:t.home, played:false, homeGoals:null, awayGoals:null});
    });
    ko.qfPending = true;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}
function _generateUclSF(ko, year){
    const kd = ko.dates; const fixtures = []; const w = ko.qf.map(t => t.winner);
    ko.sf = [[w[0],w[1]],[w[2],w[3]]].map(([h,a]) => ({ home:h, away:a, homeName:knockoutTeamName(h, state.uclLeague), awayName:knockoutTeamName(a, state.uclLeague), leg1:[null,null], leg2:[null,null], winner:null }));
    ko.sf.forEach((t,i) => {
        fixtures.push({id:'UCL-SF-'+(i+1)+'-L1', competition:'UCL', round:15, stage:'1/2 finału — 1. mecz', date:kd.sf_1, homeClubId:t.home, awayClubId:t.away, played:false, homeGoals:null, awayGoals:null});
        fixtures.push({id:'UCL-SF-'+(i+1)+'-L2', competition:'UCL', round:16, stage:'1/2 finału — 2. mecz', date:kd.sf_2, homeClubId:t.away, awayClubId:t.home, played:false, homeGoals:null, awayGoals:null});
    });
    ko.sfPending = true;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}
function _generateUclFinal(ko, year){
    const kd = ko.dates; const h = ko.sf[0].winner, a = ko.sf[1].winner;
    ko.final = {home:h, away:a, homeName:knockoutTeamName(h, state.uclLeague), awayName:knockoutTeamName(a, state.uclLeague), homeGoals:null, awayGoals:null, winner:null};
    state.fixtures.push({id:'UCL-FINAL', competition:'UCL', round:17, stage:'🏆 FINAŁ', date:kd.final, homeClubId:h, awayClubId:a, played:false, homeGoals:null, awayGoals:null});
    state.fixtures.sort((a,b) => a.date.localeCompare(b.date));
}
function uclResolveKnockoutTie(fx){ const ko = state.uclKnockout; if(!ko) return; _resolveKnockoutTie(fx, ko, 'UCL', state.uclLeague); }

// === UEL Knockout ===
function checkAndGenerateUelKnockout(){
    if(!state.uelLeague) return;
    if(!state.uelKnockout){ state.uelKnockout = {}; }
    const ko = state.uelKnockout;
    const year = parseInt(state.fixtures[0]?.date?.split('-')[0]) || 2025;
    if(!ko.generated){
        checkAndGenerateKnockout(state.uelLeague, ko, buildUelLeagueTable, 'UEL', UEL_KNOCKOUT_DATES, year);
        return;
    }
    if(ko.playoffsPending && ko.playoffs.every(t => t.winner)){ ko.playoffsPending = false; _generateUelR16(ko, year); return; }
    if(ko.r16Pending && ko.r16.every(t => t.winner)){ ko.r16Pending = false; _generateUelQF(ko, year); return; }
    if(ko.qfPending && ko.qf.every(t => t.winner)){ ko.qfPending = false; _generateUelSF(ko, year); return; }
    if(ko.sfPending && ko.sf.every(t => t.winner)){ ko.sfPending = false; _generateUelFinal(ko, year); return; }
}
function _generateUelR16(ko, year){
    const tbl = buildUelLeagueTable(); const kd = ko.dates; const fixtures = [];
    const top8 = tbl.slice(0, 8); const poWinners = ko.playoffs.map(t => t.winner);
    ko.r16 = [];
    for(let i = 0; i < 8; i++){
        const h = top8[i], a = poWinners[7-i];
        ko.r16.push({ home: h?.club_id || h, away: a, homeName: knockoutTeamName(h?.club_id || h, state.uelLeague), awayName: knockoutTeamName(a, state.uelLeague), leg1:[null,null], leg2:[null,null], winner:null });
    }
    ko.r16.forEach((t,i) => {
        fixtures.push({id:'UEL-R16-'+(i+1)+'-L1', competition:'UEL', round:11, stage:'1/8 finału — 1. mecz', date:kd.r16_1, homeClubId:t.home, awayClubId:t.away, played:false, homeGoals:null, awayGoals:null});
        fixtures.push({id:'UEL-R16-'+(i+1)+'-L2', competition:'UEL', round:12, stage:'1/8 finału — 2. mecz', date:kd.r16_2, homeClubId:t.away, awayClubId:t.home, played:false, homeGoals:null, awayGoals:null});
    });
    ko.r16Pending = true;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}
function _generateUelQF(ko, year){
    const kd = ko.dates; const fixtures = []; const w = ko.r16.map(t => t.winner);
    ko.qf = [[w[0],w[1]],[w[2],w[3]],[w[4],w[5]],[w[6],w[7]]].map(([h,a]) => ({ home:h, away:a, homeName:knockoutTeamName(h, state.uelLeague), awayName:knockoutTeamName(a, state.uelLeague), leg1:[null,null], leg2:[null,null], winner:null }));
    ko.qf.forEach((t,i) => {
        fixtures.push({id:'UEL-QF-'+(i+1)+'-L1', competition:'UEL', round:13, stage:'1/4 finału — 1. mecz', date:kd.qf_1, homeClubId:t.home, awayClubId:t.away, played:false, homeGoals:null, awayGoals:null});
        fixtures.push({id:'UEL-QF-'+(i+1)+'-L2', competition:'UEL', round:14, stage:'1/4 finału — 2. mecz', date:kd.qf_2, homeClubId:t.away, awayClubId:t.home, played:false, homeGoals:null, awayGoals:null});
    });
    ko.qfPending = true;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}
function _generateUelSF(ko, year){
    const kd = ko.dates; const fixtures = []; const w = ko.qf.map(t => t.winner);
    ko.sf = [[w[0],w[1]],[w[2],w[3]]].map(([h,a]) => ({ home:h, away:a, homeName:knockoutTeamName(h, state.uelLeague), awayName:knockoutTeamName(a, state.uelLeague), leg1:[null,null], leg2:[null,null], winner:null }));
    ko.sf.forEach((t,i) => {
        fixtures.push({id:'UEL-SF-'+(i+1)+'-L1', competition:'UEL', round:15, stage:'1/2 finału — 1. mecz', date:kd.sf_1, homeClubId:t.home, awayClubId:t.away, played:false, homeGoals:null, awayGoals:null});
        fixtures.push({id:'UEL-SF-'+(i+1)+'-L2', competition:'UEL', round:16, stage:'1/2 finału — 2. mecz', date:kd.sf_2, homeClubId:t.away, awayClubId:t.home, played:false, homeGoals:null, awayGoals:null});
    });
    ko.sfPending = true;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}
function _generateUelFinal(ko, year){
    const kd = ko.dates; const h = ko.sf[0].winner, a = ko.sf[1].winner;
    ko.final = {home:h, away:a, homeName:knockoutTeamName(h, state.uelLeague), awayName:knockoutTeamName(a, state.uelLeague), homeGoals:null, awayGoals:null, winner:null};
    state.fixtures.push({id:'UEL-FINAL', competition:'UEL', round:17, stage:'🏆 FINAŁ', date:kd.final, homeClubId:h, awayClubId:a, played:false, homeGoals:null, awayGoals:null});
    state.fixtures.sort((a,b) => a.date.localeCompare(b.date));
}
function uelResolveKnockoutTie(fx){ const ko = state.uelKnockout; if(!ko) return; _resolveKnockoutTie(fx, ko, 'UEL', state.uelLeague); }

// === UECL Knockout ===
function checkAndGenerateUeclKnockout(){
    if(!state.ueclLeague) return;
    if(!state.ueclKnockout){ state.ueclKnockout = {}; }
    const ko = state.ueclKnockout;
    const year = parseInt(state.fixtures[0]?.date?.split('-')[0]) || 2025;
    if(!ko.generated){
        checkAndGenerateKnockout(state.ueclLeague, ko, buildUeclLeagueTable, 'UECL', UECL_KNOCKOUT_DATES, year);
        return;
    }
    if(ko.playoffsPending && ko.playoffs.every(t => t.winner)){ ko.playoffsPending = false; _generateUeclR16(ko, year); return; }
    if(ko.r16Pending && ko.r16.every(t => t.winner)){ ko.r16Pending = false; _generateUeclQF(ko, year); return; }
    if(ko.qfPending && ko.qf.every(t => t.winner)){ ko.qfPending = false; _generateUeclSF(ko, year); return; }
    if(ko.sfPending && ko.sf.every(t => t.winner)){ ko.sfPending = false; _generateUeclFinal(ko, year); return; }
}
function _generateUeclR16(ko, year){
    const tbl = buildUeclLeagueTable(); const kd = ko.dates; const fixtures = [];
    const top8 = tbl.slice(0, 8); const poWinners = ko.playoffs.map(t => t.winner);
    ko.r16 = [];
    for(let i = 0; i < 8; i++){
        const h = top8[i], a = poWinners[7-i];
        ko.r16.push({ home: h?.club_id || h, away: a, homeName: knockoutTeamName(h?.club_id || h, state.ueclLeague), awayName: knockoutTeamName(a, state.ueclLeague), leg1:[null,null], leg2:[null,null], winner:null });
    }
    ko.r16.forEach((t,i) => {
        fixtures.push({id:'UECL-R16-'+(i+1)+'-L1', competition:'UECL', round:11, stage:'1/8 finału — 1. mecz', date:kd.r16_1, homeClubId:t.home, awayClubId:t.away, played:false, homeGoals:null, awayGoals:null});
        fixtures.push({id:'UECL-R16-'+(i+1)+'-L2', competition:'UECL', round:12, stage:'1/8 finału — 2. mecz', date:kd.r16_2, homeClubId:t.away, awayClubId:t.home, played:false, homeGoals:null, awayGoals:null});
    });
    ko.r16Pending = true;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}
function _generateUeclQF(ko, year){
    const kd = ko.dates; const fixtures = []; const w = ko.r16.map(t => t.winner);
    ko.qf = [[w[0],w[1]],[w[2],w[3]],[w[4],w[5]],[w[6],w[7]]].map(([h,a]) => ({ home:h, away:a, homeName:knockoutTeamName(h, state.ueclLeague), awayName:knockoutTeamName(a, state.ueclLeague), leg1:[null,null], leg2:[null,null], winner:null }));
    ko.qf.forEach((t,i) => {
        fixtures.push({id:'UECL-QF-'+(i+1)+'-L1', competition:'UECL', round:13, stage:'1/4 finału — 1. mecz', date:kd.qf_1, homeClubId:t.home, awayClubId:t.away, played:false, homeGoals:null, awayGoals:null});
        fixtures.push({id:'UECL-QF-'+(i+1)+'-L2', competition:'UECL', round:14, stage:'1/4 finału — 2. mecz', date:kd.qf_2, homeClubId:t.away, awayClubId:t.home, played:false, homeGoals:null, awayGoals:null});
    });
    ko.qfPending = true;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}
function _generateUeclSF(ko, year){
    const kd = ko.dates; const fixtures = []; const w = ko.qf.map(t => t.winner);
    ko.sf = [[w[0],w[1]],[w[2],w[3]]].map(([h,a]) => ({ home:h, away:a, homeName:knockoutTeamName(h, state.ueclLeague), awayName:knockoutTeamName(a, state.ueclLeague), leg1:[null,null], leg2:[null,null], winner:null }));
    ko.sf.forEach((t,i) => {
        fixtures.push({id:'UECL-SF-'+(i+1)+'-L1', competition:'UECL', round:15, stage:'1/2 finału — 1. mecz', date:kd.sf_1, homeClubId:t.home, awayClubId:t.away, played:false, homeGoals:null, awayGoals:null});
        fixtures.push({id:'UECL-SF-'+(i+1)+'-L2', competition:'UECL', round:16, stage:'1/2 finału — 2. mecz', date:kd.sf_2, homeClubId:t.away, awayClubId:t.home, played:false, homeGoals:null, awayGoals:null});
    });
    ko.sfPending = true;
    state.fixtures = [...state.fixtures, ...fixtures].sort((a,b) => a.date.localeCompare(b.date));
}
function _generateUeclFinal(ko, year){
    const kd = ko.dates; const h = ko.sf[0].winner, a = ko.sf[1].winner;
    ko.final = {home:h, away:a, homeName:knockoutTeamName(h, state.ueclLeague), awayName:knockoutTeamName(a, state.ueclLeague), homeGoals:null, awayGoals:null, winner:null};
    state.fixtures.push({id:'UECL-FINAL', competition:'UECL', round:17, stage:'🏆 FINAŁ', date:kd.final, homeClubId:h, awayClubId:a, played:false, homeGoals:null, awayGoals:null});
    state.fixtures.sort((a,b) => a.date.localeCompare(b.date));
}
function ueclResolveKnockoutTie(fx){ const ko = state.ueclKnockout; if(!ko) return; _resolveKnockoutTie(fx, ko, 'UECL', state.ueclLeague); }

// === Sprawdzanie wszystkich pucharow ===
function checkAllEuropeanKnockouts(){
    checkAndGenerateUclKnockout();
    checkAndGenerateUelKnockout();
    checkAndGenerateUeclKnockout();
}

// === Wynik meczu europejskiego ===
function applyEuropeanResult(fx){
    if(fx.competition === 'UCL' && state.uclLeague){
        const isLeaguePhase = fx.stage?.startsWith('Faza ligowa');
        if(isLeaguePhase){
            const h = state.uclLeague.teams.find(r => String(r.club_id) === String(fx.homeClubId));
            const a = state.uclLeague.teams.find(r => String(r.club_id) === String(fx.awayClubId));
            if(h && a){
                h.played++; a.played++;
                h.gf += fx.homeGoals; h.ga += fx.awayGoals;
                a.gf += fx.awayGoals; a.ga += f.homeGoals;
                if(fx.homeGoals > fx.awayGoals){h.won++; h.points += 3; a.lost++; pushForm(h,"W"); pushForm(a,"L");}
                else if(fx.homeGoals < fx.awayGoals){a.won++; a.points += 3; h.lost++; pushForm(a,"W"); pushForm(h,"L");}
                else{h.drawn++; a.drawn++; h.points++; a.points++; pushForm(h,"D"); pushForm(a,"D");}
            }
        }
        if(fx.id?.startsWith('UCL-PO') || fx.id?.startsWith('UCL-R16') || fx.id?.startsWith('UCL-QF') || fx.id?.startsWith('UCL-SF') || fx.id === 'UCL-FINAL'){
            uclResolveKnockoutTie(fx);
        }
        return;
    }
    if(fx.competition === 'UEL' && state.uelLeague){
        const isLeaguePhase = fx.stage?.startsWith('Faza ligowa');
        if(isLeaguePhase){
            const h = state.uelLeague.teams.find(r => String(r.club_id) === String(fx.homeClubId));
            const a = state.uelLeague.teams.find(r => String(r.club_id) === String(fx.awayClubId));
            if(h && a){
                h.played++; a.played++;
                h.gf += fx.homeGoals; h.ga += fx.awayGoals;
                a.gf += fx.awayGoals; a.ga += f.homeGoals;
                if(fx.homeGoals > fx.awayGoals){h.won++; h.points += 3; a.lost++; pushForm(h,"W"); pushForm(a,"L");}
                else if(fx.homeGoals < fx.awayGoals){a.won++; a.points += 3; h.lost++; pushForm(a,"W"); pushForm(h,"L");}
                else{h.drawn++; a.drawn++; h.points++; a.points++; pushForm(h,"D"); pushForm(a,"D");}
            }
        }
        if(fx.id?.startsWith('UEL-PO') || fx.id?.startsWith('UEL-R16') || fx.id?.startsWith('UEL-QF') || fx.id?.startsWith('UEL-SF') || fx.id === 'UEL-FINAL'){
            uelResolveKnockoutTie(fx);
        }
        return;
    }
    if(fx.competition === 'UECL' && state.ueclLeague){
        const isLeaguePhase = fx.stage?.startsWith('Faza ligowa');
        if(isLeaguePhase){
            const h = state.ueclLeague.teams.find(r => String(r.club_id) === String(fx.homeClubId));
            const a = state.ueclLeague.teams.find(r => String(r.club_id) === String(fx.awayClubId));
            if(h && a){
                h.played++; a.played++;
                h.gf += fx.homeGoals; h.ga += fx.awayGoals;
                a.gf += fx.awayGoals; a.ga += f.homeGoals;
                if(fx.homeGoals > fx.awayGoals){h.won++; h.points += 3; a.lost++; pushForm(h,"W"); pushForm(a,"L");}
                else if(fx.homeGoals < fx.awayGoals){a.won++; a.points += 3; h.lost++; pushForm(a,"W"); pushForm(h,"L");}
                else{h.drawn++; a.drawn++; h.points++; a.points++; pushForm(h,"D"); pushForm(a,"D");}
            }
        }
        if(fx.id?.startsWith('UECL-PO') || fx.id?.startsWith('UECL-R16') || fx.id?.startsWith('UECL-QF') || fx.id?.startsWith('UECL-SF') || fx.id === 'UECL-FINAL'){
            ueclResolveKnockoutTie(fx);
        }
        return;
    }
}

// === Rendering ===
function showUefa() {
    renderUefaRanking();
    renderEuropeanTables();
    showSection('uefa');
}

function renderUefaRanking(){
    const tbody = document.getElementById("uefaRankingBody");
    if(!tbody) return;
    renderUefaCups();
    if(!state.uefaData || !state.uefaData.rankings){
        tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;color:var(--muted);padding:2rem;">Brak danych rankingu UEFA</td></tr>';
        return;
    }
    const userCode = String(state.selectedLeagueCode||"").toUpperCase();
    const rows = state.uefaData.rankings.map(r => {
        const isUser = r.competition_code === userCode || UEFA_CODE_ALIASES[r.competition_code] === userCode;
        const highlight = isUser ? 'style="background:rgba(37,99,235,.15);border-left:3px solid var(--primary);"' : '';
        const s = r.seasons || {};
        return '<tr ' + highlight + '><td style="font-weight:800;color:' + (isUser?'#fff':'var(--muted)') + ';">' + r.rank + '</td><td>' + escapeHtml(r.country) + '</td><td>' + escapeHtml(r.league_name) + ' ' + (isUser?'<span style="color:var(--primary-light);font-size:.72rem;font-weight:700;margin-left:.4rem;">★ TWOJA LIGA</span>':'') + '</td><td>' + formatCoeff(s["21/22"]) + '</td><td>' + formatCoeff(s["22/23"]) + '</td><td>' + formatCoeff(s["23/24"]) + '</td><td>' + formatCoeff(s["24/25"]) + '</td><td style="font-weight:700;color:var(--accent-cyan);">' + formatCoeff(s["25/26"]) + '</td><td style="font-weight:800;color:var(--primary-light);">' + r.coefficient.toFixed(3) + '</td><td>' + r.ucl_spots + '</td><td>' + r.uel_spots + '</td><td>' + r.uecl_spots + '</td><td style="font-weight:800;">' + r.total_spots + '</td></tr>';
    }).join('');
    tbody.innerHTML = rows;
}

function formatCoeff(v){return Number.isFinite(Number(v))?Number(v).toFixed(3):"-";}

function renderUefaCups(){
    const el = document.getElementById("uefaCupsGrid");
    if(!el) return;
    const entry = state.europeanEntry;
    el.innerHTML = Object.values(UEFA_CUPS).map(c => {
        const active = entry?.short === c.short;
        let status = c.groupLabel + ' po kwalifikacji z rankingu krajowego.';
        if(active) status = '🔥 Aktualnie grasz w ' + c.name + '! Twoja druzyna walczy o trofeum.';
        else if(entry && entry.short !== c.short) status = 'Nie kwalifikujesz sie. Obecnie grasz w ' + entry.name + '.';
        return '<div class="uefa-cup-card ' + c.className + '" style="' + (active?'box-shadow:0 0 0 2px ' + c.color + '88, 0 8px 32px ' + c.color + '22;transform:translateY(-2px);':'') + '"><div class="uefa-cup-kicker">' + escapeHtml(c.short) + ' · UEFA</div><div class="uefa-cup-name">' + escapeHtml(c.name) + '</div><div class="uefa-cup-meta">' + status + '</div><div class="uefa-cup-trophy"></div>' + (active?'<div style="position:absolute;top:.8rem;right:.8rem;background:' + c.color + ';color:#fff;font-size:.65rem;font-weight:800;padding:.3rem .7rem;border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,.3);">GRASZ TERAZ</div>':'') + '</div>';
    }).join("");
}

function renderEuropeanTables(){
    const el = document.getElementById("europeanTables");
    if(!el) return;
    if(!state.europeanEntry){
        el.innerHTML = '<div class="card" style="text-align:center;padding:3rem 2rem;color:var(--muted);"><div style="font-size:3rem;margin-bottom:1rem;">🏆</div><h2 style="color:#fff;margin-bottom:.5rem;">Brak kwalifikacji europejskiej</h2><p style="max-width:400px;margin:0 auto;line-height:1.6;">Zajmij odpowiednie miejsce w lidze, aby zakwalifikowac sie do Ligi Mistrzów, Ligi Europy lub Ligi Konferencji.</p></div>';
        return;
    }
    const code = state.europeanEntry.code;
    if(code === 'UCL'){ renderUclTable(); return; }
    if(code === 'UEL'){ renderUelTable(); return; }
    if(code === 'UECL'){ renderUeclTable(); return; }
}

function _renderKnockoutCard(ko, cup, leagueData){
    if(!ko || !ko.generated) return '';
    const _renderTie = (tie, label) => {
        if(!tie.home && !tie.away) return '';
        const hn = knockoutTeamName(tie.home, leagueData), an = knockoutTeamName(tie.away, leagueData);
        const hLogo = knockoutTeamLogo(tie.home, leagueData), aLogo = knockoutTeamLogo(tie.away, leagueData);
        const l1 = tie.leg1, l2 = tie.leg2;
        const aggH = (l1[0]||0)+(l2[1]||0), aggA = (l1[1]||0)+(l2[0]||0);
        const done = tie.winner !== null;
        const isUser = String(tie.home) === String(state.team?.club_id) || String(tie.away) === String(state.team?.club_id);
        const borderDone = done ? 'border:1px solid rgba(16,185,129,.3);' : 'border:1px solid var(--border);';
        const bgDone = isUser ? 'background:rgba(37,99,235,.1);' : done ? 'background:rgba(16,185,129,.05);' : 'background:rgba(0,0,0,.15);';
        return '<div style="' + bgDone + borderDone + 'border-radius:10px;padding:.7rem .9rem;margin-bottom:.5rem;"><div style="font-size:.65rem;color:var(--muted);text-transform:uppercase;font-weight:700;margin-bottom:.4rem;">' + escapeHtml(label) + '</div><div style="display:flex;align-items:center;gap:.5rem;"><div style="flex:1;text-align:right;display:flex;align-items:center;justify-content:flex-end;gap:.4rem;' + (String(tie.winner)===String(tie.home)?'color:#10b981;font-weight:800;':'color:#fff;font-weight:600;') + '">' + clubCrestHtml(hLogo,hn,"club-crest-sm") + '<span style="font-size:.82rem;">' + escapeHtml(hn) + '</span></div><div style="text-align:center;min-width:90px;"><div style="font-size:.75rem;color:var(--muted);">' + (l1[0]!==null?l1[0]+':'+l1[1]:'– : –') + '</div><div style="font-size:.85rem;font-weight:900;color:#fff;">' + (done?aggH+':'+aggA:(l2[0]!==null?l2[0]+':'+l2[1]:'– : –')) + '</div></div><div style="flex:1;text-align:left;display:flex;align-items:center;gap:.4rem;' + (String(tie.winner)===String(tie.away)?'color:#10b981;font-weight:800;':'color:#fff;font-weight:600;') + '"><span style="font-size:.82rem;">' + escapeHtml(an) + '</span>' + clubCrestHtml(aLogo,an,"club-crest-sm") + '</div></div></div>';
    };
    let html = '';
    if(ko.playoffs && ko.playoffs.length && ko.playoffsPending !== false){
        html += '<div class="euro-table-card" style="margin-bottom:1rem;border:1px solid ' + cup.color + '33;"><div style="display:flex;align-items:center;gap:.75rem;padding:.8rem 1.1rem;border-bottom:1px solid var(--border);background:rgba(0,0,0,.2);"><div style="width:30px;height:30px;border-radius:50%;background:' + cup.color + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:.7rem;">PO</div><div><div style="font-size:.95rem;font-weight:800;color:#fff;">Playoff</div><div style="font-size:.72rem;color:var(--muted);">Miejsca 9–24 · 2 mecze</div></div></div><div style="padding:.8rem 1rem;">';
        ko.playoffs.forEach((t,i) => { html += _renderTie(t, 'Playoff ' + (i+1)); });
        html += '</div></div>';
    }
    if(ko.r16 && ko.r16.some(t => t.home)){
        html += '<div class="euro-table-card" style="margin-bottom:1rem;border:1px solid ' + cup.color + '33;"><div style="display:flex;align-items:center;gap:.75rem;padding:.8rem 1.1rem;border-bottom:1px solid var(--border);background:rgba(0,0,0,.2);"><div style="width:30px;height:30px;border-radius:50%;background:' + cup.color + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:.7rem;">1/8</div><div><div style="font-size:.95rem;font-weight:800;color:#fff;">1/8 Finału</div><div style="font-size:.72rem;color:var(--muted);">2 mecze</div></div></div><div style="padding:.8rem 1rem;">';
        ko.r16.forEach((t,i) => { if(t.home) html += _renderTie(t, '1/8 Finału ' + (i+1)); });
        html += '</div></div>';
    }
    if(ko.qf && ko.qf.some(t => t.home)){
        html += '<div class="euro-table-card" style="margin-bottom:1rem;border:1px solid #8b5cf633;"><div style="display:flex;align-items:center;gap:.75rem;padding:.8rem 1.1rem;border-bottom:1px solid var(--border);background:rgba(0,0,0,.2);"><div style="width:30px;height:30px;border-radius:50%;background:#8b5cf6;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:.7rem;">1/4</div><div><div style="font-size:.95rem;font-weight:800;color:#fff;">Cwierćfinał</div><div style="font-size:.72rem;color:var(--muted);">2 mecze</div></div></div><div style="padding:.8rem 1rem;">';
        ko.qf.forEach((t,i) => { if(t.home) html += _renderTie(t, 'Cwierćfinał ' + (i+1)); });
        html += '</div></div>';
    }
    if(ko.sf && ko.sf.some(t => t.home)){
        html += '<div class="euro-table-card" style="margin-bottom:1rem;border:1px solid #ec489933;"><div style="display:flex;align-items:center;gap:.75rem;padding:.8rem 1.1rem;border-bottom:1px solid var(--border);background:rgba(0,0,0,.2);"><div style="width:30px;height:30px;border-radius:50%;background:#ec4899;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:.7rem;">1/2</div><div><div style="font-size:.95rem;font-weight:800;color:#fff;">Półfinał</div><div style="font-size:.72rem;color:var(--muted);">2 mecze</div></div></div><div style="padding:.8rem 1rem;">';
        ko.sf.forEach((t,i) => { if(t.home) html += _renderTie(t, 'Półfinał ' + (i+1)); });
        html += '</div></div>';
    }
    if(ko.final && ko.final.home){
        const fh = ko.final.home, fa = ko.final.away;
        const fhName = knockoutTeamName(fh, leagueData), faName = knockoutTeamName(fa, leagueData);
        const fhLogo = knockoutTeamLogo(fh, leagueData), faLogo = knockoutTeamLogo(fa, leagueData);
        const finalDone = ko.final.winner !== null;
        const fWinner = String(ko.final.winner);
        const hClass = fWinner === String(fh) ? 'color:#10b981;' : 'color:#fff;';
        const aClass = fWinner === String(fa) ? 'color:#10b981;' : 'color:#fff;';
        const hColor = knockoutTeamColor(fh, leagueData);
        const aColor = knockoutTeamColor(fa, leagueData);
        const winnerName = finalDone ? escapeHtml(knockoutTeamName(ko.final.winner, leagueData)) : '';
        const scoreStr = finalDone ? ko.final.homeGoals + ' : ' + ko.final.awayGoals : 'VS';
        const badgeHtml = finalDone ? '<div style="font-size:.75rem;font-weight:700;color:#10b981;margin-top:.3rem;">🏆 ' + winnerName + '</div>' : '';
        html += '<div class="euro-table-card" style="margin-bottom:1rem;border:2px solid #fbbf2444;background:linear-gradient(135deg,rgba(251,191,36,.05),rgba(0,0,0,.2));">';
        html += '<div style="text-align:center;padding:1rem;"><div style="font-size:2rem;margin-bottom:.3rem;">🏆</div>';
        html += '<div style="font-size:1.1rem;font-weight:900;color:#fbbf24;letter-spacing:.05em;">FINAŁ</div></div>';
        html += '<div style="display:flex;align-items:center;justify-content:center;gap:1.5rem;padding:1rem 1.5rem;">';
        html += '<div style="text-align:center;' + hClass + '"><div style="width:60px;height:60px;border-radius:50%;background:' + hColor + ';margin:0 auto .4rem;';
        html += 'background-image:url("' + fhLogo + '");background-size:76%;background-repeat:no-repeat;background-position:center;"></div>';
        html += '<div style="font-size:.85rem;font-weight:800;max-width:120px;">' + escapeHtml(fhName) + '</div></div>';
        html += '<div style="text-align:center;"><div style="font-size:2rem;font-weight:900;color:#fbbf24;">' + scoreStr + '</div>' + badgeHtml + '</div>';
        html += '<div style="text-align:center;' + aClass + '"><div style="width:60px;height:60px;border-radius:50%;background:' + aColor + ';margin:0 auto .4rem;';
        html += 'background-image:url("' + faLogo + '");background-size:76%;background-repeat:no-repeat;background-position:center;"></div>';
        html += '<div style="font-size:.85rem;font-weight:800;max-width:120px;">' + escapeHtml(faName) + '</div></div>';
        html += '</div></div>';
    }
    return html;
}

function _renderSwissTable(tbl, cup, cupCode, leagueData){
    const totalTeams = tbl.length || 36;
    let html = '<div class="euro-table-card" style="margin-bottom:1.25rem;border:1px solid ' + cup.color + '33;"><div style="display:flex;align-items:center;gap:.75rem;padding:.9rem 1.2rem;border-bottom:1px solid var(--border);background:rgba(0,0,0,.2);"><div style="width:36px;height:36px;border-radius:50%;background:' + cup.color + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:.8rem;">' + cup.short + '</div><div><div style="font-size:1.1rem;font-weight:800;color:#fff;">' + cup.name + ' — Faza Ligowa</div><div style="font-size:.78rem;color:var(--muted);">' + totalTeams + ' druzyn · ' + cup.matches + ' kolejek</div></div></div><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:.82rem;"><thead><tr style="background:rgba(0,0,0,.25);"><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">#</th><th style="padding:.6rem .4rem;text-align:left;color:var(--muted);font-size:.65rem;">Druzyna</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">M</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">W</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">R</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">P</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">B+</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">B-</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">RB</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">Pkt</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">Forma</th></tr></thead><tbody>';
    tbl.forEach((r,i) => {
        const pos = i+1;
        const isUser = String(r.club_id) === String(state.team?.club_id);
        let posBg = '', posColor = 'var(--muted)';
        if(pos <= 8){ posBg = 'background:rgba(16,185,129,.1);'; posColor = '#10b981'; }
        else if(pos <= 24){ posBg = 'background:rgba(245,158,11,.08);'; posColor = '#f59e0b'; }
        else { posBg = 'background:rgba(239,68,68,.06);'; posColor = '#ef4444'; }
        if(isUser) posBg = 'background:rgba(37,99,235,.2);';
        const nameStyle = isUser ? 'color:#93c5fd;font-weight:800;' : 'color:#fff;font-weight:600;';
        const ptsStyle = isUser ? 'color:#fff;font-weight:900;font-size:1rem;' : 'color:' + posColor + ';font-weight:800;';
        const badge = isUser ? ' <span style="background:var(--primary);color:#fff;font-size:.55rem;padding:2px 5px;border-radius:4px;margin-left:.3rem;">TY</span>' : '';
        const qualBadge = r.qualType==='qualifier' ? ' <span style="background:#f97316;color:#fff;font-size:.5rem;padding:1px 4px;border-radius:3px;margin-left:.2rem;">Q</span>' : '';
        const form = (r.form||[]).slice(-5).map(v => FORM_ICON[v]||v).join(' ') || '-';
        const gd = r.gf - r.ga;
        const gdColor = gd > 0 ? '#10b981' : gd < 0 ? '#ef4444' : 'var(--muted)';
        html += '<tr style="' + posBg + 'border-bottom:1px solid rgba(255,255,255,.03);"><td style="padding:.55rem .4rem;text-align:center;font-weight:900;color:' + posColor + ';font-size:.88rem;">' + pos + '</td><td style="padding:.55rem .4rem;text-align:left;' + nameStyle + 'white-space:nowrap;">' + clubCrestHtml(r.logo_url,r.name,"club-crest-sm") + escapeHtml(r.name) + badge + qualBadge + '</td><td style="padding:.55rem .4rem;text-align:center;color:var(--muted);">' + r.played + '</td><td style="padding:.55rem .4rem;text-align:center;color:#10b981;font-weight:700;">' + r.won + '</td><td style="padding:.55rem .4rem;text-align:center;color:#9ca3af;font-weight:700;">' + r.drawn + '</td><td style="padding:.55rem .4rem;text-align:center;color:#ef4444;font-weight:700;">' + r.lost + '</td><td style="padding:.55rem .4rem;text-align:center;color:var(--muted);">' + r.gf + '</td><td style="padding:.55rem .4rem;text-align:center;color:var(--muted);">' + r.ga + '</td><td style="padding:.55rem .4rem;text-align:center;font-weight:800;color:' + gdColor + ';">' + (gd>0?'+':'') + gd + '</td><td style="padding:.55rem .4rem;text-align:center;' + ptsStyle + '">' + r.points + '</td><td style="padding:.55rem .4rem;text-align:center;font-size:.72rem;white-space:nowrap;">' + form + '</td></tr>';
    });
    html += '</tbody></table></div><div style="display:flex;gap:1.2rem;padding:.7rem 1.1rem;font-size:.75rem;color:var(--muted);border-top:1px solid var(--border);flex-wrap:wrap;background:rgba(0,0,0,.15);"><span style="display:flex;align-items:center;gap:.35rem;"><span style="width:10px;height:10px;background:#10b981;border-radius:3px;"></span>1–8: Awans do 1/8</span><span style="display:flex;align-items:center;gap:.35rem;"><span style="width:10px;height:10px;background:#f59e0b;border-radius:3px;"></span>9–24: Playoff</span><span style="display:flex;align-items:center;gap:.35rem;"><span style="width:10px;height:10px;background:#ef4444;border-radius:3px;"></span>25–36: Odpadnięcie</span></div></div>';
    return html;
}

function renderUclTable(){
    const el = document.getElementById("europeanTables");
    if(!el) return;
    const tbl = buildUclLeagueTable();
    const cup = UEFA_CUPS.UCL;
    let html = _renderSwissTable(tbl, cup, 'UCL', state.uclLeague);
    html += _renderKnockoutCard(state.uclKnockout, cup, state.uclLeague);
    el.innerHTML = html;
}

function renderUelTable(){
    const el = document.getElementById("europeanTables");
    if(!el) return;
    const tbl = buildUelLeagueTable();
    const cup = UEFA_CUPS.UEL;
    let html = _renderSwissTable(tbl, cup, 'UEL', state.uelLeague);
    html += _renderKnockoutCard(state.uelKnockout, cup, state.uelLeague);
    el.innerHTML = html;
}

function renderUeclTable(){
    const el = document.getElementById("europeanTables");
    if(!el) return;
    const tbl = buildUeclLeagueTable();
    const cup = UEFA_CUPS.UECL;
    let html = _renderSwissTable(tbl, cup, 'UECL', state.ueclLeague);
    html += _renderKnockoutCard(state.ueclKnockout, cup, state.ueclLeague);
    el.innerHTML = html;
}

function generateAllLeagueFixtures(startYear) {
    if(!state.allLeagueData) return;
    state.leagueFixtures={}; state.leagueTables={};
    for(const[code,league]of Object.entries(state.allLeagueData)){
        const ids=league.clubs.map((c)=>c.club_id);
        if(ids.length<2) continue;
        let r=[...ids]; if(r.length%2!==0) r.push("BYE");
        const rounds=[],half=r.length/2;
        for(let rd=1;rd<r.length;rd+=1){const rf=[];for(let i=0;i<half;i+=1){let h=r[i],a=r[r.length-1-i];if(h!=="BYE"&&a!=="BYE"){if(rd%2===0)[h,a]=[a,h];rf.push({homeClubId:h,awayClubId:a,round:rd});}}rounds.push(rf);r=[r[0],r[r.length-1],...r.slice(1,-1)];}
        const rev=rounds.map((r,i)=>r.map((f)=>({homeClubId:f.awayClubId,awayClubId:f.homeClubId,round:rounds.length+i+1})));
        const all=[...rounds,...rev];
        const totalRounds = all.length;
        const firstMatch = new Date(startYear, 7, 2);
        snapToMatchDay(firstMatch);
        const lastDeadline = new Date(startYear + 1, 4, 31);
        const msAvail = lastDeadline - firstMatch;
        const winterMs = 28 * 24 * 60 * 60 * 1000;
        const effectiveDays = Math.max(1, (msAvail - winterMs) / (24 * 60 * 60 * 1000));
        const gapDays = Math.max(1, Math.floor(effectiveDays / totalRounds));
        const fixtures=[];let cur=new Date(firstMatch);
        all.forEach((rf)=>{if(cur.getMonth()===11&&cur.getDate()>10) cur=new Date(cur.getFullYear()+1,0,1);
            snapToMatchDay(cur);
            if (cur > lastDeadline) cur = new Date(lastDeadline);
            rf.forEach((f)=>{fixtures.push({id:`${code}-${f.round}-${f.homeClubId}-${f.awayClubId}`,round:f.round,date:toIsoDate(cur),homeClubId:f.homeClubId,awayClubId:f.awayClubId,played:false,homeGoals:null,awayGoals:null});});
            cur.setDate(cur.getDate() + gapDays);
        });
        state.leagueFixtures[code]=fixtures;
        initLeagueTable(code,league);
    }
}

function initLeagueTable(code,league) {
    state.leagueTables[code]=league.clubs.map((c)=>({clubId:c.club_id,name:c.name,color:c.color,logo_url:c.logo_url||"",played:0,won:0,drawn:0,lost:0,gf:0,ga:0,points:0,form:[]}));
}
function initAllLeagueTables(){if(!state.allLeagueData) return; for(const[code,league]of Object.entries(state.allLeagueData)) initLeagueTable(code,league);}
function initTable(){state.table=state.allTeams.map((c)=>({clubId:c.club_id,name:c.name,color:c.color,logo_url:c.logo_url||"",played:0,won:0,drawn:0,lost:0,gf:0,ga:0,points:0,form:[]}));sortTable();}

async function prepareTransferPool() {
    const all=await loadTransfers();
    state.transferPlayers=all.filter((p)=>p.club_id!==state.team.club_id).map((p,i)=>{const mv=p.market_value_eur||0;const vm=round2(Math.max(0.1,mv/1e6));const wm=round2(Math.max(0.05,(mv>0?mv:3e5)/1e6*0.15));return{...p,id:`${p.player_id}-${i}`,valueMillions:vm,wageMillions:wm,askingPrice:round2(Math.max(0.5,vm*2.5)),expectedWage:round2(Math.max(0.05,wm*1.8)),askingPriceMillions:round2(Math.max(0.25,vm*2.5)),desiredWageMillions:wm,negoOpen:false};});
    state._transfersLoaded = true;
}
function fillTransferFilterOptions() {
    const nS = document.getElementById("transferNatFilter");
    if (!state.transferPlayers.length) return;

    const countries = new Map();
    state.transferPlayers.forEach(p => {
        const code = p.competition_code || "";
        const leagueName = p.league_name || "";
        const clubName = p.club_name || "";
        if (!code || !leagueName) return;

        const leagueInfo = state.allLeagueData?.[code];
        const country = leagueInfo?.country || "Inne";

        if (!countries.has(country)) countries.set(country, new Map());
        const leaguesMap = countries.get(country);
        if (!leaguesMap.has(leagueName)) leaguesMap.set(leagueName, new Set());
        leaguesMap.get(leagueName).add(clubName);
    });

    state._countryLeagueClubMap = countries;

    const sortedCountries = [...countries.keys()].sort((a, b) => a.localeCompare(b, "pl"));
    const cS = document.getElementById("transferCountryFilter");
    if (cS) {
        cS.innerHTML = `<option value="">Wszystkie kraje</option>${sortedCountries.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}`;
    }

    const nats = [...new Set(state.transferPlayers.flatMap(p => (p.nationalities || []).map(n => n.name || n)))].filter(Boolean).sort();
    if (nS) nS.innerHTML = `<option value="">Każda nacja</option>${nats.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("")}`;

    _populateLeagueSelect("");
    _populateClubSelect("", "");
}

function _populateLeagueSelect(country) {
    const lS = document.getElementById("transferLeagueFilter");
    if (!lS) return;
    const map = state._countryLeagueClubMap;
    if (!map) { lS.innerHTML = `<option value="">Wszystkie ligi</option>`; return; }

    let leagues;
    if (country && map.has(country)) {
        leagues = [...map.get(country).keys()];
    } else {
        leagues = [...new Set(state.transferPlayers.map(p => p.league_name || ""))].filter(Boolean);
    }
    leagues.sort((a, b) => a.localeCompare(b, "pl"));
    lS.innerHTML = `<option value="">Wszystkie ligi</option>${leagues.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join("")}`;
}

function _populateClubSelect(country, league) {
    const cS = document.getElementById("transferClubFilter");
    if (!cS) return;
    const map = state._countryLeagueClubMap;
    if (!map) { cS.innerHTML = `<option value="">Wszystkie kluby</option>`; return; }

    let clubs = new Set();
    if (country && league && map.has(country)) {
        const leaguesMap = map.get(country);
        if (leaguesMap.has(league)) clubs = leaguesMap.get(league);
    } else if (country && map.has(country)) {
        map.get(country).forEach(lc => lc.forEach(c => clubs.add(c)));
    } else {
        state.transferPlayers.forEach(p => { if (p.club_name) clubs.add(p.club_name); });
    }
    const sorted = [...clubs].sort((a, b) => a.localeCompare(b, "pl"));
    cS.innerHTML = `<option value="">Wszystkie kluby</option>${sorted.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}`;
}

function onCountryChange() {
    const country = document.getElementById("transferCountryFilter")?.value || "";
    state.transferCountry = country;
    _populateLeagueSelect(country);
    _populateClubSelect(country, "");
    state.transferLeague = "";
    state.transferClub = "";
    document.getElementById("transferLeagueFilter").value = "";
    document.getElementById("transferClubFilter").value = "";
    updateTransferFilters();
}

function onLeagueChange() {
    const country = document.getElementById("transferCountryFilter")?.value || "";
    const league = document.getElementById("transferLeagueFilter")?.value || "";
    state.transferLeague = league;
    _populateClubSelect(country, league);
    state.transferClub = "";
    document.getElementById("transferClubFilter").value = "";
    updateTransferFilters();
}

let _statsSort = "goals";
let _squadSort = { bench: "position", reserves: "rating" };

const POSITION_ORDER = { BR: 0, OB: 1, PO: 2, NA: 3 };

function sortPlayers(arr, key) {
    return [...arr].sort((a, b) => {
        switch (key) {
            case "position": return (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9) || (b.rating - a.rating);
            case "rating":   return b.rating - a.rating;
            case "age_asc":  return (a.age || 99) - (b.age || 99);
            case "age_desc": return (b.age || 0) - (a.age || 0);
            case "value":    return (b.valueMillions || 0) - (a.valueMillions || 0);
            case "fitness":  return (b.fitness || 0) - (a.fitness || 0);
            case "name":     return (a.name || "").localeCompare(b.name || "", "pl");
            default:         return 0;
        }
    });
}

function setSortBench(key) {
    _squadSort.bench = key;
    document.querySelectorAll(".bench-sort-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.sort === key));
    renderBenchList();
}

function setSortReserves(key) {
    _squadSort.reserves = key;
    document.querySelectorAll(".res-sort-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.sort === key));
    renderReservesList();
}

function switchStats(mode) {
    _statsSort = mode;
    document.getElementById("statsBtnGoals")?.classList.toggle("active", mode === "goals");
    document.getElementById("statsBtnAssists")?.classList.toggle("active", mode === "assists");
    renderStats();
}

function renderStats() {
    const tbody = document.getElementById("statsBody");
    if (!tbody || !state.players) return;
    const sorted = [...state.players].sort((a, b) => {
        if (_statsSort === "assists") return (b.assists || 0) - (a.assists || 0) || (b.goals || 0) - (a.goals || 0);
        return (b.goals || 0) - (a.goals || 0) || (b.assists || 0) - (a.assists || 0);
    });
    tbody.innerHTML = sorted.map((p, i) => {
        const pc = positionColor(p.position);
        const rc = ratingClass(p.rating);
        const g = p.goals || 0;
        const a = p.assists || 0;
        return `<tr>
            <td class="num-col">${i + 1}</td>
            <td><span class="pos-badge" style="background:${pc}22;color:${pc};border:1px solid ${pc}44;">${escapeHtml(POS_MAP[p.position] || p.position)}</span></td>
            <td style="font-weight:600;">${escapeHtml(p.name)}</td>
            <td>${p.age || "-"}</td>
            <td>${p.matches || 0}</td>
            <td class="goal-col">${g}</td>
            <td class="assist-col">${a}</td>
            <td class="ga-col">${g + a}</td>
            <td><span class="player-rating-chip ${rc}" style="font-size:.7rem;">${p.rating}</span></td>
        </tr>`;
    }).join("");
}

function renderAll(){updateDashboard();renderFormation();renderBenchList();renderReservesList();renderStats();renderTransfers();renderCurrentMatchPanels();renderCalendar();renderSchedule();renderTable();renderEuropeanTables();updateSaveStatus();}
function updateSaveStatus(){const s=document.getElementById("saveStatusSettings");if(s)s.textContent=state.saveStatus;}

// showUefa, renderUefaRanking, formatCoeff, renderUefaCups, renderEuropeanTables, buildEuropeanTable

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach((n)=>n.classList.remove("active"));
    document.querySelectorAll("nav button").forEach((n)=>n.classList.remove("active"));
    document.getElementById(sectionId)?.classList.add("active");
    const btn=document.getElementById(`btn-${sectionId}`);
    if(btn)btn.classList.add("active");
    if(sectionId==="gra"||sectionId==="simulation"){renderCurrentMatchPanels();renderCalendar?.();renderSchedule?.();}
    if(sectionId==="table"){fillLeagueTableSelector();renderTable();const cupSel=document.getElementById("cupTableSelector");if(cupSel&&cupSel.value==="cup")updateNav("Puchar Krajowy");else{const sel=document.getElementById("leagueTableSelector");const code=sel?.value||state.selectedLeagueCode;const league=state.allLeagueData?.[code];updateNav(league?league.name:"Puchar Krajowy");}}
    else updateNav();
    if(sectionId==="transfers")renderTransfers();
    if(sectionId==="settings")updateSaveStatus();
}

function updateNav(leagueName){paintBadge("navBadge",state.team.logo_url,state.team.color,initials(state.team.name));document.getElementById("navTeamName").textContent=state.coachName?`${state.coachName} · ${state.team.name}`:state.team.name;document.getElementById("navLeagueName").textContent=leagueName||state.leagueData.name;}

function updateDashboard() {
    const row=getTableRow(state.team.club_id);
    document.getElementById("clubName").textContent=state.team.name;
    document.getElementById("clubLeague").textContent=state.leagueData.name;
    document.getElementById("formationBadge").textContent=state.formation;
    document.getElementById("clubBudgetPreview").textContent=`€${formatMoney(state.budgetMillions)}M`;
    document.getElementById("matchDisplay").textContent=`${remainingUserFixtures()}`;
    document.getElementById("positionDisplay").textContent=`${(state.table.findIndex((i)=>i.clubId===state.team.club_id)+1)}`;
    document.getElementById("dateBadge").textContent=formatDateLong(state.currentDate);

    const uefa = getUefaForLeague(state.selectedLeagueCode);
    const uefaPointsEl = document.getElementById("uefaCoefficient");
    if (uefaPointsEl) {
        const pts = state.uefaPoints?.[state.selectedLeagueCode] || uefa?.coefficient || 0;
        const spots = uefa ? `LM:${uefa.ucl_spots} LE:${uefa.uel_spots} LK:${uefa.uecl_spots}` : '';
        uefaPointsEl.innerHTML = spots ? `<span style="color:var(--accent-cyan);font-weight:700;">Wsp. UEFA: ${pts.toFixed(1)}</span> <span style="color:var(--muted);font-size:.72rem;">| ${spots}</span>` : '';
    }
    paintBadge("clubBigBadge",state.team.logo_url,state.team.color,initials(state.team.name));
    document.getElementById("newsContainer").innerHTML=state.news.slice(-6).reverse().map((i)=>`<div class="news-item"><div class="date">${escapeHtml(i.date)}</div><div class="text">${escapeHtml(i.text)}</div></div>`).join("")||`<div class="news-item"><div class="text">Brak aktualnosci.</div></div>`;
    renderDashboardTable();
}

function renderDashboardTable() {
    const tbody=document.querySelector("#dashboardTable tbody");if(!tbody)return;
    const tbl=state.table;
    const zones = getLeagueZones(state.selectedLeagueCode, tbl);
    tbody.innerHTML=tbl.map((r,i)=>{const z=zones.get(i+1);const isUser=r.clubId===state.team.club_id;const cls=[isUser?"my-team":"",z?.rowClass||""].filter(Boolean).join(" ");const posCls=z?.rowClass||"pos-normal";const zoneLabel=z?` title="${escapeHtml(z.label)}"`:"";const f=r.form.slice(-5).map((v)=>FORM_ICON[v]||v).join(" ");const teamBg=!isUser&&r.color?` style="background:linear-gradient(90deg,${r.color}18,transparent 50%);"`:"";return`<tr class="${cls}"${zoneLabel}${teamBg}><td><span class="pos ${posCls}">${i+1}</span></td><td>${clubCrestHtml(r.logo_url,r.name)}${escapeHtml(r.name)} ${z?`<span class="zone-chip ${z.className}" style="margin-left:.35rem;">${escapeHtml(z.label)}</span>`:""}</td><td>${r.played}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td><td style="font-weight:800;color:var(--primary-light);">${r.points}</td><td>${f}</td></tr>`;}).join("");
    const e=document.getElementById("dashboardTableMatchDay");if(e)e.textContent=`Po ${getUserResults().length} kolejkach`;
}

function renderFormationButtons() {
    const h=document.getElementById("formationButtons");h.innerHTML="";
    Object.keys(FORMATIONS).forEach((f)=>{const b=document.createElement("button");b.textContent=f;if(f===state.formation)b.classList.add("active");b.onclick=()=>{state.formation=f;autoPick();renderFormationButtons();renderAll();};h.appendChild(b);});
}
function toggleTacticsPanel(){
    const p=document.getElementById("tacticsPanel");
    if(p)p.style.display=p.style.display==="none"?"block":"none";
}
function updateTacticsInputs(){document.getElementById("styleSelect").value=state.tactics.style;document.getElementById("pressingSelect").value=state.tactics.pressing;document.getElementById("widthSelect").value=state.tactics.width;}
function updateTactics(){state.tactics={style:document.getElementById("styleSelect").value,pressing:document.getElementById("pressingSelect").value,width:document.getElementById("widthSelect").value};}

function autoPick() {
    const rq=FORMATIONS[state.formation];const sorted=[...state.players].filter(p=>!p.injury&&!p.suspended).sort((a,b)=>b.rating-a.rating);const lineup=[];
    Object.entries(rq).forEach(([pos,count])=>{if(pos==="positions")return;sorted.filter((p)=>p.position===pos&&!lineup.some((lp)=>lp.id===p.id)).slice(0,count).forEach((p)=>lineup.push(p));});
    sorted.forEach((p)=>{if(lineup.length<11&&!lineup.some((lp)=>lp.id===p.id))lineup.push(p);});
    state.lineup=lineup.slice(0,11);state.bench=sorted.filter((p)=>!state.lineup.some((s)=>s.id===p.id)).slice(0,9);state.reserves=sorted.filter((p)=>!state.lineup.some((s)=>s.id===p.id)&&!state.bench.some((b)=>b.id===p.id));
}

function renderFormation() {
    const d=document.getElementById("formationDisplay");const pitch=d.parentElement;const df=FORMATIONS[state.formation];d.innerHTML="";
    const markings=document.createElement("div");markings.className="pitch-markings";
    markings.innerHTML=`<div class="halfway-line"></div><div class="center-circle"></div><div class="center-spot"></div><div class="penalty-area-top"></div><div class="penalty-area-bottom"></div><div class="goal-area-top"></div><div class="goal-area-bottom"></div><div class="pen-spot-top"></div><div class="pen-spot-bottom"></div><div class="arc-top"></div><div class="arc-bottom"></div><div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>`;
    d.appendChild(markings);
    const teamColor=state.team.color||"#3b82f6";
    const setupPitchDrop=(el)=>{if(!el._dropSetup){el._dropSetup=true;el.ondragover=(e)=>e.preventDefault();el.ondrop=(e)=>{e.preventDefault();moveDraggedPlayer("lineup",null);};}};
    setupPitchDrop(d);setupPitchDrop(pitch);
    const fb=document.createElement("div");fb.className="formation-badge";fb.textContent=state.formation;d.appendChild(fb);
    state.lineup.forEach((p,i)=>{const sl=df.positions[i]||{top:50,left:50};const n=document.createElement("div");n.className="player-slot";n.draggable=true;n.dataset.playerId=String(p.id);n.dataset.zone="lineup";n.style.top=`${sl.top}%`;n.style.left=`${sl.left}%`;n.style.transform="translate(-50%,-50%)";n.onclick=()=>showPlayerModal(p);n.addEventListener("mouseenter",(e)=>showPlayerTooltip(p,e));n.addEventListener("mousemove",(e)=>{const el=document.getElementById("playerTooltip");if(el&&el.style.display==="block")positionTooltip(el,e);});n.addEventListener("mouseleave",hidePlayerTooltip);const bc=ratingBorderColor(p.rating);const rc=ratingClass(p.rating);const rbc=ratingBorderColor(p.rating);const fitPct=p.fitness||96;const fitColor=fitPct>=85?'#10b981':fitPct>=65?'#f59e0b':'#ef4444';n.innerHTML=`<div class="shirt" style="background:${teamColor};border-color:${bc};box-shadow:0 0 6px ${bc}44,0 3px 8px rgba(0,0,0,.4);"><div class="rating-badge" style="background:${rbc};">${p.rating}</div>${i+1}<div class="fit-indicator" style="position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);width:40px;height:4px;background:rgba(0,0,0,.5);border-radius:2px;overflow:hidden;"><div style="width:${fitPct}%;height:100%;background:${fitColor};border-radius:2px;"></div></div></div><div class="name">${escapeHtml(p.name.split(' ').pop())}</div>`;n.addEventListener("dragstart",onPlayerDragStart);n.addEventListener("dragover",onPlayerDragOver);n.addEventListener("drop",onPitchPlayerDrop);n.addEventListener("dragend",onPlayerDragEnd);d.appendChild(n);});
}

function renderSquadList(){const l=document.getElementById("squadList");l.innerHTML="";l.dataset.zone="lineup";setupDropZone(l,"lineup");state.lineup.forEach((p,i)=>l.appendChild(buildPlayerRow(p,i+1,"lineup")));}
function renderBenchList() {
    const l = document.getElementById("benchList");
    if (!l) return;
    l.dataset.zone = "bench";
    setupDropZone(l, "bench");
    const sorted = sortPlayers(state.bench, _squadSort.bench);
    l.innerHTML = "";
    sorted.forEach((p, i) => l.appendChild(buildPlayerRow(p, i + 1, "bench")));
}

function renderReservesList() {
    const l = document.getElementById("reservesList");
    if (!l) return;
    l.dataset.zone = "reserves";
    setupDropZone(l, "reserves");
    if (!state.reserves) state.reserves = [];
    const sorted = sortPlayers(state.reserves, _squadSort.reserves);
    l.innerHTML = "";
    sorted.forEach(p => l.appendChild(buildPlayerRow(p, "-", "reserves")));
}

function ratingClass(rating){
    if(rating>=88)return"elite";
    if(rating>=80)return"gold";
    if(rating>=70)return"silver";
    if(rating>=60)return"bronze";
    return"dark";
}
function ratingBorderColor(rating){
    if(rating>=88)return"#ffd700";
    if(rating>=80)return"#fbbf24";
    if(rating>=70)return"#94a3b8";
    if(rating>=60)return"#cd7f32";
    return"#333";
}
function positionColor(pos){return pos==="BR"?"#f59e0b":pos==="OB"?"#3b82f6":pos==="PO"?"#10b981":"#ef4444";}

function buildPlayerRow(player,badge,zone) {
    const r=document.createElement("div");r.className=zone==="lineup"?"squad-player":"bench-player";
    r.draggable=true;r.dataset.playerId=String(player.id);r.dataset.zone=zone;
    r.onclick=()=>showPlayerModal(player);
    r.addEventListener("mouseenter",(e)=>showPlayerTooltip(player,e));
    r.addEventListener("mousemove",(e)=>{const el=document.getElementById("playerTooltip");if(el&&el.style.display==="block")positionTooltip(el,e);});
    r.addEventListener("mouseleave",hidePlayerTooltip);
    r.addEventListener("dragstart",onPlayerDragStart);r.addEventListener("dragover",onPlayerDragOver);r.addEventListener("drop",onPlayerDropOnPlayer);r.addEventListener("dragend",onPlayerDragEnd);
    const rc=ratingClass(player.rating);
    const pc=positionColor(player.position);
    r.classList.add(rc);
    const fitPct=player.fitness||96;
    const fitColor=fitPct>=85?'#10b981':fitPct>=65?'#f59e0b':'#ef4444';
    const sh=`<span class="shirt-icon" style="background:${pc};display:inline-block;width:18px;height:16px;border-radius:3px 3px 2px 2px;position:relative;vertical-align:middle;margin-right:4px;flex-shrink:0;"><span style="position:absolute;top:-3px;left:50%;transform:translateX(-50%);width:8px;height:3px;background:${pc};border-radius:1px 1px 0 0;"></span></span>`;
    r.innerHTML=`<div class="num" style="background:${pc};color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.7rem;flex-shrink:0;">${escapeHtml(badge)}</div><div class="info"><div class="p-name">${sh}${escapeHtml(player.name)}</div><div class="p-details">${escapeHtml(POS_MAP[player.position])} | ${player.age||"-"} lat | €${formatMoney(player.valueMillions)}M</div></div><div class="player-rating-chip ${rc}">${player.rating}<span class="fit-dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${fitColor};margin-left:4px;vertical-align:middle;" title="Kondycja: ${fitPct}%"></span>${player.injury ? `<span class="inj-badge" title="${escapeHtml(player.injury.type)} — ${player.injury.daysLeft} dni">KON</span>` : player.suspended ? `<span class="susp-badge" title="Zawieszony">ZAW</span>` : ""}</div>`;
    return r;
}
function onPlayerDragStart(e){state.dragPlayerId=Number(e.currentTarget.dataset.playerId);state.dragSource=e.currentTarget.dataset.zone;e.dataTransfer.effectAllowed="move";e.currentTarget.classList.add("dragging");}
function onPlayerDragOver(e){e.preventDefault();}
function onPlayerDropOnPlayer(e){e.preventDefault();moveDraggedPlayer(e.currentTarget.dataset.zone,Number(e.currentTarget.dataset.playerId));}
function onPlayerDragEnd(e){e.currentTarget.classList.remove("dragging");}
function setupDropZone(el,zone){el.ondragover=(e)=>e.preventDefault();el.ondrop=(e)=>{e.preventDefault();moveDraggedPlayer(zone,null);};}

function onPitchPlayerDrop(e){
    e.preventDefault();
    const targetId=Number(e.currentTarget.dataset.playerId);
    if(!state.dragPlayerId||!state.dragSource)return;
    if(state.dragSource==="lineup"){moveDraggedPlayer("lineup",targetId);return;}
    const fromArr=state.dragSource==="bench"?state.bench:state.reserves;
    const idx=fromArr.findIndex((p)=>p.id===state.dragPlayerId);
    if(idx<0)return;
    const[player]=fromArr.splice(idx,1);
    const posIdx=state.lineup.findIndex((p)=>p.id===targetId);
    if(posIdx>=0){const[swapped]=state.lineup.splice(posIdx,1,player);fromArr.push(swapped);}
    else{state.lineup.push(player);}
    trimSquadLists();state.dragPlayerId=null;state.dragSource=null;renderFormation();renderBenchList();renderReservesList();
}

function moveDraggedPlayer(targetZone,targetId) {
    if(!state.dragPlayerId||!state.dragSource)return;
    const sA=state.dragSource==="lineup"?state.lineup:(state.dragSource==="bench"?state.bench:state.reserves);
    const tA=targetZone==="lineup"?state.lineup:(targetZone==="bench"?state.bench:state.reserves);
    const si=sA.findIndex((p)=>p.id===state.dragPlayerId);if(si<0)return;
    const[dragged]=sA.splice(si,1);
    if(targetId){const ti=tA.findIndex((p)=>p.id===targetId);if(ti>=0){if(sA===tA){tA.splice(ti,0,dragged);}else{const[swapped]=tA.splice(ti,1,dragged);sA.splice(Math.min(si,sA.length),0,swapped);}}else{tA.push(dragged);}}else{tA.push(dragged);}
    trimSquadLists();state.dragPlayerId=null;state.dragSource=null;renderFormation();renderBenchList();renderReservesList();
}
function trimSquadLists(){state.lineup=state.lineup.slice(0,11);if(state.lineup.length<11)state.lineup.push(...state.bench.splice(0,11-state.lineup.length));if(state.lineup.length<11)state.lineup.push(...state.reserves.splice(0,11-state.lineup.length));if(state.bench.length>9)state.reserves.push(...state.bench.splice(9));if(!state.reserves)state.reserves=[];state.reserves=[...state.reserves,...state.players.filter((p)=>!state.lineup.some((s)=>s.id===p.id)&&!state.bench.some((b)=>b.id===p.id)&&!state.reserves.some((r)=>r.id===p.id))];}

function updateTransferFilters() {
    state.transferQuery   = (document.getElementById("transferNameFilter")?.value || "").trim().toLowerCase();
    state.transferAgeMin  = document.getElementById("transferAgeMin")?.value   || "";
    state.transferAgeMax  = document.getElementById("transferAgeMax")?.value   || "";
    state.transferRatingMin = document.getElementById("transferRatingMin")?.value || "";
    state.transferRatingMax = document.getElementById("transferRatingMax")?.value || "";
    state.transferValueMax  = document.getElementById("transferValueMax")?.value  || "";
    state.transferClub    = document.getElementById("transferClubFilter")?.value   || "";
    state.transferLeague  = document.getElementById("transferLeagueFilter")?.value || "";
    state.transferNat     = document.getElementById("transferNatFilter")?.value    || "";
    state.transferCountry = document.getElementById("transferCountryFilter")?.value || "";
    state.transferSortBy  = document.getElementById("transferSortBy")?.value       || "rating";
    renderTransfers();
}

function clearTransferFilters() {
    ["transferNameFilter","transferAgeMin","transferAgeMax","transferRatingMin",
     "transferRatingMax","transferValueMax","transferClubFilter","transferLeagueFilter","transferNatFilter","transferCountryFilter"]
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    state.transferQuery = state.transferAgeMin = state.transferAgeMax = "";
    state.transferRatingMin = state.transferRatingMax = state.transferValueMax = "";
    state.transferClub = state.transferLeague = state.transferNat = "";
    state.transferCountry = "";
    state.transferFilter = "all";
    fillTransferFilterOptions();
    renderTransfers();
}

function filterTransfers(filter){state.transferFilter=filter;renderTransfers();}

function renderTransfers() {
    const budgetEl = document.getElementById("transferBudget");
    if (budgetEl) budgetEl.textContent = `€${formatMoney(state.budgetMillions)}M`;
    const wbEl = document.getElementById("wageBudgetDisplay");
    if (wbEl) wbEl.textContent = `${wageToKPerWeek(state.wageBudgetMillions)}K/tydz`;
    const scEl = document.getElementById("squadCountDisplay");
    if (scEl) scEl.textContent = `${state.players.length}`;

    document.querySelectorAll(".position-quick-filters .btn").forEach(b => {
        const f = b.getAttribute("onclick")?.match(/'([^']+)'/)?.[1] || "all";
        b.classList.toggle("active", f === state.transferFilter);
    });

    const winBadge = document.getElementById("transferWindowBadge");
    if (winBadge) {
        if (state.transferWindow === "summer") {
            winBadge.textContent = "Letnie okienko";
            winBadge.className = "badge badge-green badge-lg";
        } else if (state.transferWindow === "winter") {
            winBadge.textContent = "Zimowe okienko";
            winBadge.className = "badge badge-orange badge-lg";
        } else {
            winBadge.textContent = "Okno zamknięte";
            winBadge.className = "badge badge-lg";
        }
    }
    const list = document.getElementById("transferList");
    if (!list) return;
    if (!state.transferPlayers.length) {
        if (state._transfersLoaded) {
            list.innerHTML = `<div class="transfer-empty"><span style="font-size:2rem;"></span><p>Brak zawodników dostęnych na rynku.</p></div>`;
        } else {
            list.innerHTML = `<div class="transfer-empty"><div class="loader-spinner" style="margin:0 auto 1rem;"></div><p>Ładowanie zawodników...</p></div>`;
        }
        return;
    }

    let filtered = state.transferPlayers.filter(p => {
        const name  = String(p.name || "").toLowerCase();
        const cn    = String(p.club_name   || p.club   || "");
        const ln    = String(p.league_name || p.league || "");
        const age   = Number(p.age   || 0);
        const rat   = Number(p.rating || 0);
        const val   = Number(p.valueMillions || 0);
        const pNats = (p.nationalities || []).map(n => n.name || n);
        const posOk = state.transferFilter === "all" || p.position === state.transferFilter;
        const playerCountry = state.allLeagueData?.[p.competition_code]?.country || "";
        return posOk
            && (!state.transferQuery    || name.includes(state.transferQuery))
            && (!state.transferAgeMin   || age  >= Number(state.transferAgeMin))
            && (!state.transferAgeMax   || age  <= Number(state.transferAgeMax))
            && (!state.transferRatingMin|| rat  >= Number(state.transferRatingMin))
            && (!state.transferRatingMax|| rat  <= Number(state.transferRatingMax))
            && (!state.transferValueMax || val  <= Number(state.transferValueMax))
            && (!state.transferClub     || cn   === state.transferClub)
            && (!state.transferLeague   || ln   === state.transferLeague)
            && (!state.transferNat      || pNats.includes(state.transferNat))
            && (!state.transferCountry  || playerCountry === state.transferCountry);
    });

    const sortKey = state.transferSortBy || "rating";
    filtered.sort((a, b) => {
        switch (sortKey) {
            case "rating":     return (b.rating || 0) - (a.rating || 0);
            case "rating_asc": return (a.rating || 0) - (b.rating || 0);
            case "age_asc":    return (a.age || 99)   - (b.age || 99);
            case "age_desc":   return (b.age || 0)    - (a.age || 0);
            case "value_asc":  return (a.valueMillions || 0) - (b.valueMillions || 0);
            case "value_desc": return (b.valueMillions || 0) - (a.valueMillions || 0);
            case "name":       return (a.name || "").localeCompare(b.name || "", "pl");
            default:           return (b.rating || 0) - (a.rating || 0);
        }
    });

    const shown = filtered.slice(0, 80);
    const countEl = document.getElementById("transferCount");
    if (countEl) countEl.textContent = `Znaleziono: ${filtered.length} zawodników${filtered.length > 80 ? " (pokazuję 80)" : ""}`;

    if (!shown.length) {
        list.innerHTML = `<div class="transfer-empty"><span style="font-size:2rem;"></span><p>Brak zawodników dla wybranych filtrów.</p></div>`;
        return;
    }

    list.innerHTML = shown.map(p => {
        const pid    = String(p.player_id || p.id || p.name).replace(/[^a-zA-Z0-9_-]/g, "_");
        const rawPid = String(p.player_id || p.id || p.name);
        const rc  = ratingClass(p.rating || 0);
        const bc  = ratingBorderColor(p.rating || 0);
        const pc  = positionColor(p.position);
        const pos = POS_MAP[p.position] || p.position || "?";

        const askK = wageToKPerWeek(p.askingPrice  || 0);
        const expK = wageToKPerWeek(p.expectedWage || 0);
        const initFeeM = formatMoney(p.negoFee  ?? p.askingPrice  ?? 0);
        const initWageK = p.negoWageK ?? expK;

        const canAffordFee  = (p.askingPrice  || 0) <= state.budgetMillions;
        const canAffordWage = (p.expectedWage || 0) <= state.wageBudgetMillions;

        const photo = p.photo_url
            ? `<img src="${escapeHtml(p.photo_url)}" alt="" class="tc-photo" onerror="this.style.display='none'">`
            : `<div class="tc-photo tc-photo-fallback" style="background:${pc};">${escapeHtml(pos)}</div>`;

        const nat = (p.nationalities || []).slice(0, 2)
            .map(n => `<span class="tc-flag">${escapeHtml(n.name || n)}</span>`).join("");

        const alreadyOwned = state.players.some(sp =>
            String(sp.player_id || sp.name) === String(p.player_id || p.name));

        const feedback = p.lastResult
            ? `<div class="nego-feedback ${p.lastResult.ok ? 'nego-ok' : 'nego-bad'}">${p.lastResult.msg}</div>`
            : '';

        const clubAccent=p.club_color?`border-left:4px solid ${p.club_color};background:linear-gradient(135deg,${p.club_color.replace(')',' / 0.06)')},transparent 60%);`:"";
        return `
<div class="tc-card" style="border-color:${bc}55;${clubAccent}">
  <div class="tc-card-top">
    ${photo}
    <div class="tc-card-info">
      <div class="tc-name">${escapeHtml(p.name || "Nieznany")}</div>
      <div class="tc-meta">
        <span class="tc-pos-chip" style="background:${pc}22;color:${pc};border:1px solid ${pc}44;">${escapeHtml(pos)}</span>
        <span class="tc-age">${p.age || "?"} lat</span>
        ${nat}
      </div>
      <div class="tc-club">${escapeHtml(p.club_name || "Wolny agent")} · ${escapeHtml(p.league_name || "")}</div>
    </div>
    <span class="player-rating-chip ${rc}" style="flex-shrink:0;">${p.rating || "?"}</span>
  </div>

  <div class="tc-finance">
    <div class="tc-fin-item">
      <span class="tc-fin-label">Kwota wywoławcza</span>
      <span class="tc-fin-val ${canAffordFee ? 'ok' : 'bad'}">€${formatMoney(p.askingPrice || 0)}M</span>
    </div>
    <div class="tc-fin-item">
      <span class="tc-fin-label">Pensja oczekiwana</span>
      <span class="tc-fin-val ${canAffordWage ? 'ok' : 'bad'}">${expK}K/tydz</span>
    </div>
  </div>

  ${alreadyOwned
    ? `<div class="tc-owned"> Już w drużynie</div>`
    : `
  <button class="btn ${p.negoOpen ? 'btn-secondary' : 'btn-primary'} btn-sm"
    style="width:100%;justify-content:center;"
    onclick="toggleNegotiation('${escapeHtml(rawPid)}')">
    ${p.negoOpen ? 'Zamknij negocjacje' : 'Negocjuj transfer'}
  </button>

  <div class="nego-box ${p.negoOpen ? 'active' : ''}">
    ${feedback}
    <div class="nego-hint">
      Min. akceptowalna kwota: ~€${formatMoney(round2((p.askingPrice||0)*0.75))}M
      · Min. pensja: ~${wageToKPerWeek(round2((p.expectedWage||0)*0.78))}K/tydz
    </div>
    <div class="nego-grid">
      <div>
        <label class="nego-label">Twoja oferta (M€)</label>
        <input type="number" step="0.1" min="0.1" id="fee-${escapeHtml(pid)}"
          value="${initFeeM}" placeholder="${formatMoney(p.askingPrice||0)}">
      </div>
      <div>
        <label class="nego-label">Pensja (K€/tydz)</label>
        <input type="number" step="1" min="1" id="wage-${escapeHtml(pid)}"
          value="${initWageK}" placeholder="${expK}">
      </div>
    </div>
    <div class="nego-rounds">${p.negoRounds ? `Runda negocjacji: ${p.negoRounds}` : 'Pierwsza oferta'}</div>
    <button class="btn btn-accent btn-sm" style="width:100%;justify-content:center;margin-top:.4rem;"
      onclick="submitOffer('${escapeHtml(rawPid)}','${escapeHtml(pid)}')">
      Złóż ofertę
    </button>
  </div>`
  }
</div>`;
    }).join("");
}

// ─── SILNIK NEGOCJACJI ────────────────────────────────────────────────────

function wageToKPerWeek(mPerYear) { return Math.round((mPerYear || 0) * 1000 / 52); }
function wageFromKPerWeek(kPerWeek) { return round2((kPerWeek || 0) * 52 / 1000); }

function evaluateOffer(p, feeMoffered, wageKoffered) {
    const asking   = p.askingPrice   || 0;
    const expWageM = p.expectedWage  || 0;
    const expWageK = wageToKPerWeek(expWageM);
    const wageOfferedM = wageFromKPerWeek(wageKoffered);

    const rounds = p.negoRounds || 0;
    const patience = Math.min(rounds * 0.02, 0.10);

    const minFeePct  = 0.75 - patience;
    const minWagePct = 0.78 - patience;

    const minFee  = round2(asking  * minFeePct);
    const minWage = round2(expWageM * minWagePct);

    if (feeMoffered < minFee) {
        const need = round2(minFee - feeMoffered);
        const counter = round2(asking * (0.90 + Math.random() * 0.08));
        return {
            accepted: false, type: 'fee_hard',
            msg: ` Klub odrzuca. Oferta za niska o €${formatMoney(need)}M. Kontrpropozycja: €${formatMoney(counter)}M`,
            counterFee: counter, counterWageK: null,
        };
    }

    if (wageOfferedM < minWage) {
        const needK = wageToKPerWeek(minWage - wageOfferedM);
        const counterWageM = round2(expWageM * (0.88 + Math.random() * 0.10));
        const counterK = wageToKPerWeek(counterWageM);
        return {
            accepted: false, type: 'wage_hard',
            msg: ` Zawodnik odrzuca pensję — za mała o ${needK}K/tydz. Żąda: ${counterK}K/tydz`,
            counterFee: null, counterWageK: counterK,
        };
    }

    const feePct  = feeMoffered  / Math.max(0.01, asking);
    const wagePct = wageOfferedM / Math.max(0.001, expWageM);

    const feeChance  = feePct  >= 1.0 ? 1 : Math.pow((feePct  - minFeePct)  / (1 - minFeePct),  1.6);
    const wageChance = wagePct >= 1.0 ? 1 : Math.pow((wagePct - minWagePct) / (1 - minWagePct), 1.4);

    if (Math.random() > feeChance) {
        const counter = round2(asking * (0.92 + Math.random() * 0.07));
        return {
            accepted: false, type: 'fee_soft',
            msg: ` Klub nie zgadza się na tę kwotę. Ich kontrpropozycja: €${formatMoney(counter)}M`,
            counterFee: counter, counterWageK: null,
        };
    }

    if (Math.random() > wageChance) {
        const counterWageM = round2(expWageM * (0.90 + Math.random() * 0.08));
        const counterK = wageToKPerWeek(counterWageM);
        return {
            accepted: false, type: 'wage_soft',
            msg: ` Zawodnik chce więcej. Jego propozycja: ${counterK}K/tydz`,
            counterFee: null, counterWageK: counterK,
        };
    }

    return { accepted: true, msg: ` Oferta zaakceptowana!` };
}

function toggleNegotiation(rawPid) {
    const p = _findTransferPlayer(rawPid);
    if (!p) return;
    p.negoOpen = !p.negoOpen;
    renderTransfers();
}

function submitOffer(rawPid, safePid) {
    const p = _findTransferPlayer(rawPid);
    if (!p) return;

    const feeInput  = document.getElementById(`fee-${safePid}`);
    const wageInput = document.getElementById(`wage-${safePid}`);
    const feeM  = round2(Number(feeInput?.value  ?? 0));
    const wageK = Math.round(Number(wageInput?.value ?? 0));

    if (feeM <= 0 || wageK <= 0) {
        p.lastResult = { ok: false, msg: ' Wpisz kwotę transferu i pensję.' };
        renderTransfers(); return;
    }
    if (feeM > state.budgetMillions) {
        p.lastResult = { ok: false, msg: ` Brakuje Ci €${formatMoney(feeM - state.budgetMillions)}M budżetu.` };
        renderTransfers(); return;
    }
    const wageM = wageFromKPerWeek(wageK);
    if (wageM > state.wageBudgetMillions) {
        p.lastResult = { ok: false, msg: ` Przekroczony budżet płacowy.` };
        renderTransfers(); return;
    }

    p.negoRounds = (p.negoRounds || 0) + 1;
    const result = evaluateOffer(p, feeM, wageK);

    if (!result.accepted) {
        if (result.counterFee   !== null) p.negoFee  = result.counterFee;
        if (result.counterWageK !== null) p.negoWageK = result.counterWageK;
        p.lastResult = { ok: false, msg: result.msg };
        p.negoOpen = true;
        renderTransfers();
        return;
    }

    const squadSize=(state.players?.length||0)+(state.bench?.length||0)+(state.reserves?.length||0);

    const nid = state.players.reduce((m, sp) => Math.max(m, Number(sp.id) || 0), 0) + 1;
    const signed = enrichPlayer({
        ...p,
        market_value_eur: Math.round(feeM * 1e6),
        market_value: `€${formatMoney(feeM)} mln`,
    }, nid);
    signed.valueMillions = feeM;
    signed.wageMillions  = wageM;

    state.players.push(signed);
    state.reserves = state.reserves || [];
    state.reserves.push(signed);
    state.transferPlayers = state.transferPlayers.filter(tp =>
        String(tp.player_id || tp.id || tp.name) !== String(rawPid));
    state.budgetMillions     = round2(state.budgetMillions     - feeM);
    state.wageBudgetMillions = round2(state.wageBudgetMillions - wageM);
    state.team.players   = state.players;
    state.team.squad_size = state.players.length;

    addNews(` Transfer: ${p.name} dołącza za €${formatMoney(feeM)}M · ${wageK}K/tydz`);
    autoPick();
    _transferMsg(` ${p.name} podpisał kontrakt za €${formatMoney(feeM)}M!`, 'ok');
    renderAll();
}

function _findTransferPlayer(rawPid) {
    return state.transferPlayers.find(p =>
        String(p.player_id || p.id || p.name) === String(rawPid));
}

function _transferMsg(text, type) {
    const el = document.getElementById("transferMsg");
    if (!el) return;
    el.textContent = text;
    el.className = `transfer-msg ${type}`;
    el.style.display = "block";
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.display = "none"; }, 3500);
}

// ─── LISTA SPRZEDAŻY ──────────────────────────────────────────────────────

function switchTransferTab(tab) {
    document.getElementById("panel-buy").style.display  = tab === "buy"  ? "" : "none";
    document.getElementById("panel-sell").style.display = tab === "sell" ? "" : "none";
    document.getElementById("tab-buy").classList.toggle("active",  tab === "buy");
    document.getElementById("tab-sell").classList.toggle("active", tab === "sell");
    if (tab === "sell") renderSaleList();
}

function listPlayerForSale(playerId) {
    const p = state.players.find(pl => pl.id === playerId);
    if (!p) return;
    const alreadyListed = state.forSale.some(s => s.playerId === playerId);
    if (alreadyListed) { _transferMsg("Zawodnik jest już wystawiony.", "bad"); return; }
    const suggested = round2(p.valueMillions * 1.15);
    const priceStr = prompt(`Wystaw ${p.name} na sprzedaż.\nCena wywoławcza (M€) [sugestia: ${suggested}]:`, String(suggested));
    if (!priceStr) return;
    const price = round2(Number(priceStr));
    if (!price || price <= 0) { _transferMsg("Nieprawidłowa cena.", "bad"); return; }
    state.forSale.push({ playerId, price, listedDate: toIsoDate(state.currentDate), offers: [] });
    addNews(`Wystawiono na sprzedaż: ${p.name} za €${formatMoney(price)}M`);
    _transferMsg(` ${p.name} wystawiony za €${formatMoney(price)}M`, "ok");
    renderSaleList();
    renderAll();
}

function removePlayerFromSale(playerId) {
    state.forSale = state.forSale.filter(s => s.playerId !== playerId);
    renderSaleList();
}

function acceptSaleOffer(playerId, offerId) {
    const listing = state.forSale.find(s => s.playerId === playerId);
    if (!listing) return;
    const offer = listing.offers.find(o => o.offerId === offerId);
    if (!offer) return;
    const p = state.players.find(pl => pl.id === playerId);
    if (!p) return;

    state.budgetMillions     = round2(state.budgetMillions + offer.fee);
    state.wageBudgetMillions = round2(state.wageBudgetMillions + (p.wageMillions || 0));
    state.players = state.players.filter(pl => pl.id !== playerId);
    state.lineup  = state.lineup.filter(pl => pl.id !== playerId);
    state.bench   = state.bench.filter(pl => pl.id !== playerId);
    state.reserves = (state.reserves || []).filter(pl => pl.id !== playerId);
    state.forSale = state.forSale.filter(s => s.playerId !== playerId);

    addNews(` Sprzedano: ${p.name} do ${offer.clubName} za €${formatMoney(offer.fee)}M`);
    autoPick();
    _transferMsg(` ${p.name} sprzedany za €${formatMoney(offer.fee)}M!`, "ok");
    renderAll(); renderSaleList();
}

function rejectSaleOffer(playerId, offerId) {
    const listing = state.forSale.find(s => s.playerId === playerId);
    if (!listing) return;
    listing.offers = listing.offers.filter(o => o.offerId !== offerId);
    renderSaleList();
}

function generateAITransferOffers() {
    if (!state.forSale.length || !state.allTeams.length) return;
    const aiClubs = state.allTeams.filter(c => c.club_id !== state.team.club_id);
    if (!aiClubs.length) return;

    state.forSale.forEach(listing => {
        if (Math.random() > 0.08) return;
        if (listing.offers.length >= 3) return;

        const club = aiClubs[Math.floor(Math.random() * aiClubs.length)];
        if (listing.offers.some(o => o.clubId === club.club_id)) return;

        const p = state.players.find(pl => pl.id === listing.playerId);
        if (!p) return;

        const strengthRatio = (club.avg_rating || 70) / Math.max(1, p.rating);
        const feeMultiplier = 0.60 + Math.random() * 0.55 + (strengthRatio > 1 ? 0.15 : 0);
        const fee = round2(listing.price * feeMultiplier);
        const offerId = `offer-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;

        listing.offers.push({ clubId: club.club_id, clubName: club.name, fee, offerId });
        addNews(`Oferta: ${club.name} chce kupić ${p.name} za €${formatMoney(fee)}M`);
    });
}

function renderSaleList() {
    const el = document.getElementById("saleList");
    if (!el) return;

    const notListed = state.players.filter(p => !state.forSale.some(s => s.playerId === p.id));
    const listedIds = new Set(state.forSale.map(s => s.playerId));

    const notListedHtml = notListed.length ? `
        <div class="card" style="margin-bottom:1rem;">
            <h3 style="margin-bottom:.75rem;">Twoi zawodnicy — wystaw na sprzedaż</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.6rem;">
                ${sortPlayers(notListed, "position").map(p => {
                    const pc = positionColor(p.position);
                    const rc = ratingClass(p.rating);
                    return `<div style="display:flex;align-items:center;gap:.6rem;background:rgba(0,0,0,.2);border-radius:10px;padding:.6rem .8rem;border:1px solid var(--border);">
                        <span class="player-rating-chip ${rc}" style="flex-shrink:0;">${p.rating}</span>
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:700;font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(p.name)}</div>
                            <div style="font-size:.72rem;color:var(--muted);">${POS_MAP[p.position]} · ${p.age} lat · €${formatMoney(p.valueMillions)}M</div>
                        </div>
                        <button class="btn btn-orange btn-sm" onclick="listPlayerForSale(${p.id})">Wystaw</button>
                    </div>`;
                }).join("")}
            </div>
        </div>` : "";

    const listedHtml = state.forSale.length ? state.forSale.map(listing => {
        const p = state.players.find(pl => pl.id === listing.playerId);
        if (!p) return "";
        const pc = positionColor(p.position);
        const rc = ratingClass(p.rating);
        const offersHtml = listing.offers.length
            ? listing.offers.map(o => {
                const pct = Math.round(o.fee / listing.price * 100);
                const offerColor = pct >= 90 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444';
                return `<div class="sale-offer-row">
                    <div>
                        <div style="font-weight:700;font-size:.88rem;">${escapeHtml(o.clubName)}</div>
                        <div style="font-size:.72rem;color:var(--muted);">${pct}% ceny wywoławczej</div>
                    </div>
                    <span style="font-weight:900;font-size:1rem;color:${offerColor};">€${formatMoney(o.fee)}M</span>
                    <div style="display:flex;gap:.4rem;">
                        <button class="btn btn-primary btn-sm" onclick="acceptSaleOffer(${listing.playerId},'${o.offerId}')"> Przyjmij</button>
                        <button class="btn btn-secondary btn-sm" onclick="rejectSaleOffer(${listing.playerId},'${o.offerId}')">X</button>
                    </div>
                </div>`;
            }).join("")
            : `<div style="font-size:.82rem;color:var(--muted);padding:.5rem 0;">Oczekiwanie na oferty...</div>`;

        return `<div class="card sale-player-card">
            <div style="display:flex;align-items:center;gap:.8rem;margin-bottom:.75rem;">
                <span class="player-rating-chip ${rc}">${p.rating}</span>
                <div style="flex:1;">
                    <div style="font-weight:800;font-size:1rem;">${escapeHtml(p.name)}</div>
                    <div style="font-size:.78rem;color:var(--muted);">${POS_MAP[p.position]} · ${p.age} lat · Wartość: €${formatMoney(p.valueMillions)}M</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:.68rem;color:var(--muted);">Cena wywoławcza</div>
                    <div style="font-weight:900;color:#fbbf24;font-size:1.1rem;">€${formatMoney(listing.price)}M</div>
                </div>
                <button class="btn btn-red btn-sm" onclick="removePlayerFromSale(${listing.playerId})">X Wycofaj</button>
            </div>
            <div style="font-size:.72rem;font-weight:700;color:var(--muted);margin-bottom:.4rem;text-transform:uppercase;">Oferty (${listing.offers.length})</div>
            <div class="sale-offers-list">${offersHtml}</div>
        </div>`;
    }).join("") : `<div style="text-align:center;padding:2rem;color:var(--muted);">Brak wystawionych zawodników.</div>`;

    el.innerHTML = notListedHtml + (state.forSale.length ? `<h3 style="margin-bottom:.75rem;">Wystawieni na sprzedaż</h3>${listedHtml}` : listedHtml);
}

function updateSimSpeed(){simSpeedMs=Number(document.getElementById("simSpeedSelect")?.value||500);}

function renderCurrentMatchPanels() {
    const iso=toIsoDate(state.currentDate);const fx=getUserFixtureByDate(iso);
    const log=document.getElementById("matchLog");if(log)log.innerHTML=state.matchLog.slice(-8).reverse().map((l)=>`<div>${escapeHtml(l)}</div>`).join("");
    const info=state.seasonFinished?seasonFinishedInfo():fx?matchInfoFromFixture(fx):trainingDayInfo();
    updateMatchPanel("matchDayBadge","matchDate","homeLogo","homeName","awayLogo","awayName","scoreDisplay","simBtn",info,true);
    updateMatchPanel("dashboardMatchBadge","dashboardMatchDate","dashboardHomeLogo","dashboardHomeName","dashboardAwayLogo","dashboardAwayName","dashboardScore","dashboardPlayBtn",info,false);
    const simBtn = document.getElementById("simBtn");
    if (simBtn) {
        if (state.seasonFinished) {
            simBtn.innerHTML = '<i class="fi fi-rr-trophy"></i> Podsumowanie sezonu';
            simBtn.className = 'btn btn-orange btn-lg btn-glow';
            simBtn.onclick = showSeasonEndModal;
        } else {
            simBtn.innerHTML = '<i class="fi fi-br-play-alt"></i> ROZPOCZNIJ MECZ';
            simBtn.className = 'btn btn-primary btn-lg btn-glow';
            simBtn.onclick = startSimulation;
        }
    }
}

function matchInfoFromFixture(fx){
  const h = getClub(fx.homeClubId), a = getClub(fx.awayClubId);
  return {
    badge: fixtureRoundLabel(fx),
    date: formatDateLong(state.currentDate),
    home: h,
    away: a,
    score: fx.played ? `${fx.homeGoals}:${fx.awayGoals}` : "-:-",
    playable: !fx.played,
    button: fx.played ? "Mecz rozegrany" : " Rozegraj mecz"
  };
}
function trainingDayInfo(){return{badge:"Dzień treningowy",date:formatDateLong(state.currentDate),home:state.team,away:{name:describeDay(),logo_url:"",color:"var(--bg-light)"},score:"TRENING",playable:false,button:"Brak meczu"};}
function seasonFinishedInfo(){return{badge:" Koniec sezonu",date:formatDateLong(state.currentDate),home:state.team,away:{name:"Podsumowanie",logo_url:"",color:"#1f2937"},score:"KONIEC",playable:true,button:" Podsumowanie sezonu"};}

function updateMatchPanel(badgeId,dateId,hLogoId,hNameId,aLogoId,aNameId,scoreId,btnId,info,_unused) {
    document.getElementById(badgeId).textContent=info.badge;
    document.getElementById(dateId).textContent=info.date;
    paintBadge(hLogoId,info.home.logo_url,info.home.color,initials(info.home.name));
    paintBadge(aLogoId,info.away.logo_url,info.away.color,initials(info.away.name));
    document.getElementById(hNameId).textContent=info.home.name;
    document.getElementById(aNameId).textContent=info.away.name;
    document.getElementById(scoreId).textContent=info.score;
    const b=document.getElementById(btnId);b.textContent=info.button;
    b.onclick = startSimulation;
    b.disabled = !info.playable;
}

async function startSimulation(){
    if(state.seasonFinished) return;
    const fx=getUserFixtureByDate(toIsoDate(state.currentDate));
    if(!fx||fx.played)return;
    if(state.liveMatch?.running) return;
    showMatchModeModal(fx);
}

function showMatchModeModal(fx){
    const h=getClub(fx.homeClubId), a=getClub(fx.awayClubId);
    const hLogo=h?.logo_url||''; const aLogo=a?.logo_url||'';
    const hColor=h?.color||'#1f2937'; const aColor=a?.color||'#1f2937';
    const badge=`<div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;font-weight:700;letter-spacing:.06em;margin-bottom:.75rem;">${escapeHtml(getFixtureCompetitionLabel(fx))}</div>`;
    const teams=`<div style="display:flex;align-items:center;justify-content:center;gap:1.25rem;margin-bottom:1.5rem;">
        <div style="text-align:center;">
            <div style="width:56px;height:56px;border-radius:50%;background:${hColor};margin:0 auto .35rem;background-image:url('${hLogo}');background-size:76%;background-repeat:no-repeat;background-position:center;"></div>
            <div style="font-size:.8rem;font-weight:700;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(h?.name||'')}</div>
        </div>
        <div style="font-size:1.5rem;font-weight:900;color:var(--muted);">vs</div>
        <div style="text-align:center;">
            <div style="width:56px;height:56px;border-radius:50%;background:${aColor};margin:0 auto .35rem;background-image:url('${aLogo}');background-size:76%;background-repeat:no-repeat;background-position:center;"></div>
            <div style="font-size:.8rem;font-weight:700;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(a?.name||'')}</div>
        </div>
    </div>`;
    const c=document.getElementById('modalContent');
    c.innerHTML=`<div style="text-align:center;">
        <h2 style="margin:.25rem 0 .5rem;">Wybierz tryb meczu</h2>
        ${badge}${teams}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
            <button class="btn btn-secondary btn-lg" onclick="closeModal();runQuickSim();" style="display:flex;flex-direction:column;align-items:center;gap:.4rem;padding:1.1rem .75rem;height:auto;">
                <span style="font-size:1.6rem;">⚡</span>
                <span style="font-weight:900;">Szybka symulacja</span>
                <span style="font-size:.72rem;color:var(--muted);font-weight:400;">Natychmiastowy wynik</span>
            </button>
            <button class="btn btn-primary btn-lg" onclick="closeModal();runLiveSim();" style="display:flex;flex-direction:column;align-items:center;gap:.4rem;padding:1.1rem .75rem;height:auto;">
                <span style="font-size:1.6rem;">▶</span>
                <span style="font-weight:900;">Symulacja na żywo</span>
                <span style="font-size:.72rem;color:rgba(255,255,255,.7);font-weight:400;">1 minuta = 1 sekunda</span>
            </button>
        </div>
    </div>`;
    document.getElementById('modal').classList.add('active');
}

async function _prepareMatchLineup(){
    state.lineup.forEach(p => { p._suspendedBeforeMatch = !!p.suspended; });
    const suspended = state.lineup.filter(p => p.suspended && !p.injury);
    if(suspended.length > 0){
        suspended.forEach(sp => {
            const replacement = state.bench.find(bp => bp.position === sp.position && !bp.suspended);
            if(replacement){
                const sidx = state.lineup.indexOf(sp);
                const bidx = state.bench.indexOf(replacement);
                if(sidx >= 0 && bidx >= 0){
                    state.lineup[sidx] = replacement;
                    state.bench[bidx] = sp;
                    sp.suspended = false;
                }
            }
        });
        addNews(`Zawieszenia: ${suspended.map(p=>p.name).join(", ")} pomija mecz.`);
        await renderFormation();
    }
}

async function runQuickSim(){
    if(state.seasonFinished) return;
    const fx=getUserFixtureByDate(toIsoDate(state.currentDate));
    if(!fx||fx.played) return;
    await _prepareMatchLineup();
    const h=getClub(fx.homeClubId), a=getClub(fx.awayClubId);
    const result=generateScore(h,a,fx);
    const report=buildMatchReport(h,a,fx,result);
    fx.homeGoals=result.homeGoals; fx.awayGoals=result.awayGoals;
    fx.matchReport=report; fx.played=true;
    const myG=fx.homeClubId===state.team.club_id?fx.homeGoals:fx.awayGoals;
    const opG=fx.homeClubId===state.team.club_id?fx.awayGoals:fx.homeGoals;
    const opp=fx.homeClubId===state.team.club_id?a.name:h.name;
    const rw=myG>opG?"wygrywa":myG===opG?"remisuje":"przegrywa";
    state.results.push({date:fx.date,round:fx.round,home:h.name,away:a.name,homeGoals:fx.homeGoals,awayGoals:fx.awayGoals,userMatch:true});
    state.matchLog.unshift(`${formatDateLong(state.currentDate)}: ${getFixtureCompetitionLabel(fx)} — ${state.team.name} ${rw} z ${opp} ${myG}:${opG}.`);
    addNews(`${getFixtureCompetitionLabel(fx)}: ${state.team.name} ${rw} z ${opp} ${myG}:${opG}`);
    applySquadEffects(myG, opG);
    state.lineup.forEach(p=>{ if(p._suspendedBeforeMatch){p.suspended=false;delete p._suspendedBeforeMatch;} });
    simulateAllLeagueFixturesForDate(fx.date); sortTable();
    renderAll(); showMatchResult();
}

async function runLiveSim(){
    if(state.seasonFinished) return;
    const fx=getUserFixtureByDate(toIsoDate(state.currentDate));
    if(!fx||fx.played) return;
    await _prepareMatchLineup();
    startLiveMatchSimulation(fx, 1000);
}

function startLiveMatchSimulation(fx, speedMs){
    const h=getClub(fx.homeClubId), a=getClub(fx.awayClubId);
    const result=generateScore(h,a,fx);
    const report=buildMatchReport(h,a,fx,result);
    state.liveMatch={running:true,fixtureId:fx.id,minute:0,homeGoals:0,awayGoals:0,result,report,shownEvents:0,timer:null,half:1,speedMs:speedMs||1000};
    document.querySelector(".match-day-big-card")?.classList.add("live-match-running");
    const btn=document.getElementById("simBtn"); if(btn){btn.disabled=true;btn.textContent="Mecz trwa...";}
    const stop=document.getElementById("stopBtn"); if(stop)stop.style.display="inline-flex";
    initMatchLiveStats(report);
    const log=document.getElementById("matchLog"); if(log) log.innerHTML=`<div style="color:var(--primary-light);font-weight:700;">0' Pierwszy gwizdek! Mecz rozpoczęty.</div>`;
    updateLiveScoreboard(fx);
    runLiveMinute();
}

function initMatchLiveStats(report){
    const container = document.getElementById("matchContainer");
    if(!container) return;
    let statsEl = document.getElementById("matchLiveStats");
    if(!statsEl){
        statsEl = document.createElement("div");
        statsEl.id = "matchLiveStats";
        const logConsole = container.querySelector(".match-log-console");
        if(logConsole) container.insertBefore(statsEl, logConsole);
        else container.appendChild(statsEl);
    }
    renderLiveStats(report);
}

function renderLiveStats(report){
    const el = document.getElementById("matchLiveStats");
    if(!el || !report) return;
    const lm = state.liveMatch;
    const pct = lm?.minute ? Math.min(100, Math.round((lm.minute/90)*100)) : 0;
    el.style.cssText = "display:grid;grid-template-columns:1fr auto 1fr;gap:.4rem 1rem;background:rgba(0,0,0,.35);border:1px solid var(--border);border-radius:10px;padding:.75rem 1rem;margin:1rem 0;font-size:.82rem;";
    el.innerHTML = `
        <div style="text-align:right;color:#fff;font-weight:800;">${report.possessionHome}%</div>
        <div style="text-align:center;color:var(--primary-light);font-weight:800;font-size:.7rem;text-transform:uppercase;">Posiadanie</div>
        <div style="text-align:left;color:#fff;font-weight:800;">${report.possessionAway}%</div>
        <div style="text-align:right;color:var(--muted);font-weight:700;">${report.shotsHome}</div>
        <div style="text-align:center;color:var(--primary-light);font-weight:800;font-size:.7rem;text-transform:uppercase;">Strzały</div>
        <div style="text-align:left;color:var(--muted);font-weight:700;">${report.shotsAway}</div>
        <div style="text-align:right;color:var(--muted);font-weight:700;">${report.onTargetHome}</div>
        <div style="text-align:center;color:var(--primary-light);font-weight:800;font-size:.7rem;text-transform:uppercase;">Celne</div>
        <div style="text-align:left;color:var(--muted);font-weight:700;">${report.onTargetAway}</div>
        <div style="text-align:right;color:var(--muted);font-weight:700;">${report.xgHome}</div>
        <div style="text-align:center;color:var(--primary-light);font-weight:800;font-size:.7rem;text-transform:uppercase;">xG</div>
        <div style="text-align:left;color:var(--muted);font-weight:700;">${report.xgAway}</div>
        <div style="grid-column:1/-1;margin-top:.3rem;">
            <div style="height:3px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--primary),var(--accent-cyan));border-radius:2px;transition:width .3s;"></div>
            </div>
            <div style="text-align:center;font-size:.65rem;color:var(--muted);margin-top:.2rem;">${lm?.minute||0}' / 90'</div>
        </div>`;
}

function runLiveMinute(){
    const lm=state.liveMatch;
    if(!lm?.running) return;
    const fx=state.fixtures.find(f=>f.id===lm.fixtureId);
    if(!fx){state.liveMatch=null;return;}
    lm.minute += 1;

    if(lm.minute === 45){
        addLiveLog("45' +"+rand(1,4)+" — Koniec pierwszej połowy.", "whistle");
        lm.half = 2;
        updateLiveScoreboard(fx); renderLiveStats(lm.report);
        lm.timer=setTimeout(runLiveMinute, lm.speedMs||1000);
        return;
    }
    if(lm.minute === 46){
        addLiveLog("46' Druga połowa rozpoczęta.", "whistle");
    }

    const due = lm.report.events.filter(e=>e.min<=lm.minute);
    while(lm.shownEvents < due.length){
        const ev = due[lm.shownEvents++];
        if(ev.type==="goal"){
            if(ev.team===getClub(fx.homeClubId)?.name) lm.homeGoals += 1;
            else lm.awayGoals += 1;
            addLiveLog(`${ev.min}' ⚽ ${ev.text}`, "goal");
        } else if(ev.type==="card"){
            addLiveLog(`${ev.min}' 🟨 ${ev.text}`, "card");
        } else if(ev.type==="red"){
            addLiveLog(`${ev.min}' 🟥 ${ev.text}`, "red");
        } else if(ev.type==="sub"){
            addLiveLog(`${ev.min}' 🔄 ${ev.text}`, "sub");
        } else {
            addLiveLog(`${ev.min}' ${ev.text}`, "chance");
        }
    }

    if(lm.minute % 10 === 0 && lm.minute < 90 && due.length === 0){
        const comments = ["Spokojna faza meczu, wymiana podań w środku pola.","Żadna z drużyn nie potrafi przełamać defensywy.","Kibice domagają się akcji!","Gra toczy się głównie między 16. a 16.","Obie drużyny szukają luki w obronie."];
        addLiveLog(`${lm.minute}' ${comments[rand(0, comments.length-1)]}`, "neutral");
    }

    updateLiveScoreboard(fx); renderLiveStats(lm.report);
    if(lm.minute>=90){
        addLiveLog(`90' +${rand(2,5)} — Sędzia kończy mecz!`, "whistle");
        finishLiveMatch(fx); return;
    }
    lm.timer=setTimeout(runLiveMinute, lm.speedMs||1000);
}

function updateLiveScoreboard(fx){
    const lm=state.liveMatch;
    const score=document.getElementById("scoreDisplay");
    const dash=document.getElementById("dashboardScore");
    const clock=document.getElementById("matchClock");
    if(score) score.textContent=`${lm?.homeGoals ?? fx.homeGoals ?? 0}:${lm?.awayGoals ?? fx.awayGoals ?? 0}`;
    if(dash) dash.textContent=score?.textContent || "-:-";
    if(clock) clock.textContent=`${String(Math.min(lm?.minute||0,90)).padStart(2,"0")}:00`;
}

function addLiveLog(text, type="neutral"){
    const log=document.getElementById("matchLog");
    if(!log) return;
    let color = "var(--muted)"; let bg = "transparent"; let fw = "";
    if(type==="goal") { color = "#34d399"; bg = "rgba(16,185,129,.1)"; fw="font-weight:800;"; }
    if(type==="card") { color = "#fbbf24"; bg = "rgba(251,191,36,.1)"; }
    if(type==="red")  { color = "#ef4444"; bg = "rgba(239,68,68,.1)"; fw="font-weight:700;"; }
    if(type==="whistle") { color = "#60a5fa"; bg = "rgba(59,130,246,.1)"; fw="font-weight:700;"; }
    if(type==="sub")  { color = "#a78bfa"; }
    const div = document.createElement("div");
    div.style.cssText = `padding:.35rem .5rem;border-radius:6px;margin-bottom:.25rem;color:${color};background:${bg};${fw}font-size:.85rem;border-left:3px solid ${type==="goal"?"#10b981":type==="red"?"#ef4444":type==="whistle"?"#3b82f6":"transparent"};`;
    div.textContent = text;
    log.insertBefore(div, log.firstChild);
    while(log.children.length > 40) log.removeChild(log.lastChild);
}

function finishLiveMatch(fx){
    const lm=state.liveMatch;
    if(!lm) return;
    fx.homeGoals=lm.result.homeGoals; fx.awayGoals=lm.result.awayGoals;
    fx.matchReport=lm.report; fx.played=true;
    const h=getClub(fx.homeClubId), a=getClub(fx.awayClubId);
    state.results.push({date: fx.date, round: fx.round, home: h.name, away: a.name, homeGoals: fx.homeGoals, awayGoals: fx.awayGoals, userMatch: true});
    const myG = fx.homeClubId === state.team.club_id ? fx.homeGoals : fx.awayGoals;
    const opG = fx.homeClubId === state.team.club_id ? fx.awayGoals : fx.homeGoals;
    const opp = fx.homeClubId === state.team.club_id ? a.name : h.name;
    const rw = myG > opG ? "wygrywa" : myG === opG ? "remisuje" : "przegrywa";
    state.matchLog.unshift(`${formatDateLong(state.currentDate)}: ${getFixtureCompetitionLabel(fx)} — ${state.team.name} ${rw} z ${opp} ${myG}:${opG}.`);
    addNews(`${getFixtureCompetitionLabel(fx)}: ${state.team.name} ${rw} z ${opp} ${myG}:${opG}`);
    addLiveLog(`KONIEC: ${h.name} ${fx.homeGoals}:${fx.awayGoals} ${a.name}`, "whistle");
    addLiveLog(`Podsumowanie: Strzały ${lm.report.shotsHome}-${lm.report.shotsAway} | xG ${lm.report.xgHome}-${lm.report.xgAway}`, "neutral");
    applySquadEffects(myG, opG);
    state.lineup.forEach(p => { if (p._suspendedBeforeMatch) { p.suspended = false; delete p._suspendedBeforeMatch; } });
    simulateAllLeagueFixturesForDate(fx.date); sortTable();
    document.querySelector(".match-day-big-card")?.classList.remove("live-match-running");
    state.liveMatch=null;
    const btn=document.getElementById("simBtn"); if(btn){btn.disabled=false; btn.textContent="ROZPOCZNIJ MECZ"; btn.onclick=startSimulation;}
    const stop=document.getElementById("stopBtn"); if(stop)stop.style.display="none";
    renderAll(); showMatchResult();
}
function progressInjuries() {
    const recovered = [];
    state.players.forEach(p => {
        if (!p.injury) return;
        p.injury.daysLeft -= 1;
        if (p.injury.daysLeft <= 0) {
            recovered.push(p.name);
            p.fitness = rand(55, 70);
            delete p.injury;
        }
    });
    if (recovered.length) {
        addNews(`Powrot do zdrowia: ${recovered.join(", ")}.`);
        autoPick();
    }
}

async function simulateDay() {
    if (state.seasonFinished) return;

    if (isPastSeasonEnd()) {
        state.seasonFinished = true;
        state.transferWindow = "summer";
        stopSimulation();
        await finishSeasonNow();
        renderAll();
        return;
    }

    progressInjuries?.();

    const iso = toIsoDate(state.currentDate);
    const hadFixture = hasPendingFixturesOnDate(iso);

    applyTrainingEffects?.(hadFixture);

    // Symuluj inne ligi CODZIENNIE, nie tylko w dni meczu gracza
    simulateAllLeagueFixturesForDate(iso);

    if (hadFixture) simulateFixturesForDate(iso);

    checkAllEuropeanKnockouts();

    state.players.forEach(p => {
        if (p.fitness < 96) p.fitness = Math.min(96, p.fitness + (p.position === "BR" ? 3 : 2));
    });

    state.currentDate.setDate(state.currentDate.getDate() + 1);
    state.calendarDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth(), 1);

    const m = state.currentDate.getMonth();
    const d = state.currentDate.getDate();
    if (m === 0 && d === 1) state.transferWindow = "winter";
    else if (m === 2 && d === 1) state.transferWindow = null;

    generateAITransferOffers?.();
    renderAll();
    if (hadFixture) showMatchResult();
}

function stopSimulation(){if(state.simTimer){clearTimeout(state.simTimer);state.simTimer=null;}if(state.liveMatch?.timer){clearTimeout(state.liveMatch.timer);state.liveMatch=null;document.querySelector(".match-day-big-card")?.classList.remove("live-match-running");}state.simulating=false;state.simMode="none";state.calendarTargetDate=toIsoDate(state.currentDate);const sb=document.getElementById("stopBtn");if(sb)sb.style.display="none";renderAll();}
function simulateToWindow(){const next=state.fixtures.find((f)=>!f.played&&(f.homeClubId===state.team.club_id||f.awayClubId===state.team.club_id)&&f.date>=toIsoDate(state.currentDate));if(!next)return;if(state.simulating){stopSimulation();return;}startTimedSimulation(next.date,"next-match");}
function startTimedSimulation(targetIso,mode){if(!targetIso||state.seasonFinished)return;if(state.simTimer)clearTimeout(state.simTimer);state.simulating=true;state.simMode=mode;state.calendarTargetDate=targetIso;const sb=document.getElementById("stopBtn");if(sb)sb.style.display="inline-flex";renderAll();state.simTimer=setTimeout(runSimulationLoop,simSpeedMs);}
async function runSimulationLoop(){try{if(!state.simulating||state.seasonFinished){stopSimulation();return;}if(!state.calendarTargetDate||toIsoDate(state.currentDate)>=state.calendarTargetDate){stopSimulation();return;}await simulateDay();if(state.seasonFinished||toIsoDate(state.currentDate)>=state.calendarTargetDate){stopSimulation();return;}state.simTimer=setTimeout(runSimulationLoop,simSpeedMs);}catch(e){console.error("Simulation error:",e);stopSimulation();}}
function skipToDate(isoDate){if(!isoDate)return;state.calendarTargetDate=isoDate;state.calendarDate=new Date(`${isoDate}T12:00:00`);if(state.simulating){startTimedSimulation(isoDate,"calendar");return;}if(isoDate<=toIsoDate(state.currentDate)){renderCalendar();return;}startTimedSimulation(isoDate,"calendar");}

function simulateFixturesForDate(isoDate){
    const fxs = getFixturesByDate(isoDate).filter(f => !f.played);
    if(!fxs.length) return;

    const userFixture = fxs.find(fx => isUserFixture(fx));
    if(userFixture){
        state.lineup.forEach(p => { p._suspendedBeforeMatch = !!p.suspended; });
        const suspended = state.lineup.filter(p => p.suspended && !p.injury);
        suspended.forEach(sp => {
            const replacement = state.bench.find(bp => bp.position === sp.position && !bp.suspended);
            if(replacement){
                const sidx = state.lineup.indexOf(sp);
                const bidx = state.bench.indexOf(replacement);
                if(sidx >= 0 && bidx >= 0){
                    state.lineup[sidx] = replacement;
                    state.bench[bidx] = sp;
                    sp.suspended = false;
                }
            }
        });
        if(suspended.length) addNews(`Zawieszenia: ${suspended.map(p=>p.name).join(", ")} pomija mecz.`);
    }

    fxs.forEach(fx => {
        const h = getClub(fx.homeClubId), a = getClub(fx.awayClubId);
        if(!h || !a) return;

        const r = generateScore(h, a, fx);
        fx.homeGoals = r.homeGoals;
        fx.awayGoals = r.awayGoals;
        fx.matchReport = buildMatchReport(h, a, fx, r);
        fx.played = true;
        
        if(!fx.competition || fx.competition==="league") {
            applyResultToTable(fx);
        } else {
            applyEuropeanResult(fx);
        }
        
        state.results.push({date: isoDate, round: fx.round, home: h.name, away: a.name, homeGoals: fx.homeGoals, awayGoals: fx.awayGoals, userMatch: isUserFixture(fx)});

        if(isUserFixture(fx)){
            const myG = fx.homeClubId === state.team.club_id ? fx.homeGoals : fx.awayGoals;
            const opG = fx.homeClubId === state.team.club_id ? fx.awayGoals : fx.homeGoals;
            const opp = fx.homeClubId === state.team.club_id ? a.name : h.name;
            const rw = myG > opG ? "wygrywa" : myG === opG ? "remisuje" : "przegrywa";
            const compLabel = getFixtureCompetitionLabel(fx);
            state.matchLog.unshift(`${formatDateLong(state.currentDate)}: ${compLabel} — ${state.team.name} ${rw} z ${opp} ${myG}:${opG}.`);
            addNews(`${compLabel}: ${state.team.name} ${rw} z ${opp} ${myG}:${opG}`);
            applySquadEffects(myG, opG);
            state.lineup.forEach(p => {
                if (p._suspendedBeforeMatch) { p.suspended = false; delete p._suspendedBeforeMatch; }
            });
        }
    });

    sortTable();
}

function buildMatchReport(h,a,fx,score){
    const hPower=(h.avg_rating||68)+(fx.homeClubId===state.team.club_id?userTeamBonus():0)+rand(-4,4);
    const aPower=(a.avg_rating||68)+(fx.awayClubId===state.team.club_id?userTeamBonus():0)+rand(-4,4);
    const total=Math.max(1,hPower+aPower);
    const possession=clamp(Math.round((hPower/total)*100+rand(-6,6)),35,65);
    const hShots=Math.max(score.homeGoals, rand(6,16)+Math.round((hPower-aPower)/8));
    const aShots=Math.max(score.awayGoals, rand(5,15)+Math.round((aPower-hPower)/8));
    const hOn=Math.max(score.homeGoals, Math.min(hShots, Math.round(hShots*(0.34+Math.random()*0.22))));
    const aOn=Math.max(score.awayGoals, Math.min(aShots, Math.round(aShots*(0.34+Math.random()*0.22))));
    const events=[]; const used=new Set();
    const minute=()=>{let m;do{m=rand(2,90)+(Math.random()<0.08?rand(1,5):0);}while(used.has(m));used.add(m);return m;};

    for(let i=0;i<score.homeGoals;i++) events.push({min:minute(),team:h.name,type:"goal",text:`GOL! ${h.name} strzela na ${i+1}:${score.awayGoals||0}`});
    for(let i=0;i<score.awayGoals;i++) events.push({min:minute(),team:a.name,type:"goal",text:`GOL! ${a.name} strzela na ${score.homeGoals||0}:${i+1}`});

    const cards = rand(2,5);
    for(let i=0;i<cards;i++){
        const team = Math.random() < possession/100 ? h : a;
        events.push({min:minute(),team:team.name,type:"card",text:`Żółta kartka dla zawodnika ${team.name}`});
    }
    if(Math.random() < 0.08){
        const team = Math.random() < possession/100 ? a : h;
        events.push({min:minute(),team:team.name,type:"red",text:`CZERWONA KARTKA! ${team.name} w osłabieniu`});
    }
    for(let i=0;i<rand(2,4);i++){
        const team = Math.random() < 0.5 ? h : a;
        events.push({min:minute(),team:team.name,type:"sub",text:`Zmiana w ${team.name}`});
    }
    const extra=["groźny strzał obroniony przez bramkarza","świetna interwencja obrońcy","rzut rożny — dobitka głową obok słupka","szybka kontra zakończona spalonym","strzał z dystansu nad poprzeczką","faul na granicy pola karnego","dośrodkowanie, ale nikt nie zamyka"];
    for(let i=0;i<rand(6,10);i++){
        const team=Math.random()<possession/100?h:a;
        events.push({min:minute(),team:team.name,type:"chance",text:`${team.name}: ${extra[rand(0,extra.length-1)]}`});
    }
    events.sort((x,y)=>x.min-y.min);
    return {possessionHome:possession,possessionAway:100-possession,shotsHome:hShots,shotsAway:aShots,onTargetHome:hOn,onTargetAway:aOn,xgHome:round2(score.homeGoals*0.65+hOn*0.18+rand(0,30)/100),xgAway:round2(score.awayGoals*0.65+aOn*0.18+rand(0,30)/100),events};
}


function simulateAllLeagueFixturesForDate(isoDate) {
    if(!state.allLeagueData||!state.leagueFixtures)return;
    for(const[code,fixtures]of Object.entries(state.leagueFixtures)){if(code===state.selectedLeagueCode)continue;const league=state.allLeagueData[code];if(!league)continue;const dayF=fixtures.filter((f)=>f.date===isoDate&&!f.played);dayF.forEach((f)=>{const h=league.clubs.find((c)=>c.club_id===f.homeClubId),a=league.clubs.find((c)=>c.club_id===f.awayClubId);if(!h||!a)return;const r={homeGoals:calculateGoals(h.avg_rating+rand(-5,5),a.avg_rating+rand(-5,5)),awayGoals:calculateGoals(a.avg_rating+rand(-5,5),h.avg_rating+rand(-5,5))};f.homeGoals=r.homeGoals;f.awayGoals=r.awayGoals;f.played=true;const tbl=state.leagueTables[code];if(tbl)applyResultToTableRaw(tbl,f);});}
    for(const code of Object.keys(state.leagueTables))sortTableRaw(state.leagueTables[code]);
}

function applyResultToTableRaw(tbl,fx){const h=tbl.find((r)=>r.clubId===fx.homeClubId),a=tbl.find((r)=>r.clubId===fx.awayClubId);if(!h||!a)return;h.played+=1;a.played+=1;h.gf+=fx.homeGoals;h.ga+=fx.awayGoals;a.gf+=fx.awayGoals;a.ga+=fx.homeGoals;if(fx.homeGoals>fx.awayGoals){h.won+=1;h.points+=3;a.lost+=1;pushForm(h,"W");pushForm(a,"L");}else if(fx.homeGoals<fx.awayGoals){a.won+=1;a.points+=3;h.lost+=1;pushForm(a,"W");pushForm(h,"L");}else{h.drawn+=1;a.drawn+=1;h.points+=1;a.points+=1;pushForm(h,"D");pushForm(a,"D");}}
function sortTableRaw(tbl){tbl.sort((a,b)=>(b.points-a.points)||((b.gf-b.ga)-(a.gf-a.ga))||(b.gf-a.gf)||a.name.localeCompare(b.name,"pl"));}

function generateScore(h,a,fx){
    const hs = AI_STYLES[Math.floor(Math.random()*AI_STYLES.length)];
    const as = AI_STYLES[Math.floor(Math.random()*AI_STYLES.length)];
    
    let hp = (h.avg_rating||70) + rand(-3,3);
    let ap = (a.avg_rating||70) + rand(-3,3);
    
    if(fx.homeClubId === state.team.club_id) {
        hp += userTeamBonus();
    } else {
        hp += aiTacticBonus(hs, h.avg_rating);
    }
    
    if(fx.awayClubId === state.team.club_id) {
        ap += userTeamBonus();
    } else {
        ap += aiTacticBonus(as, a.avg_rating);
    }
    
    // Bonus własnego boiska
    hp += 1.2;
    
    // Pobierz rating bramkarza (dla gracza ze składu, dla AI z avg)
    const getKeeper = (teamId) => {
        if(teamId === state.team?.club_id) {
            const gk = state.lineup.find(p => p.position === "BR");
            return gk ? gk.rating : 65;
        }
        return 68; // średni AI-keeper
    };
    
    const hKeeper = getKeeper(fx.homeClubId);
    const aKeeper = getKeeper(fx.awayClubId);
    
    return {
        homeGoals: calculateGoals(hp, ap * 0.88, aKeeper >= 78),
        awayGoals: calculateGoals(ap, hp * 0.88, hKeeper >= 78)
    };
}
function aiTacticBonus(s,r){switch(s){case"attacking":return 1.2+rand(0,2);case"defensive":return 0.5+rand(-1,1);case"possession":return 0.8+rand(-.5,1.5);case"counter":return 1+rand(-1,3);default:return 0.5+rand(-1,2);}}
function calculateGoals(tp, op, hasGoodKeeper){
    // tp = siła ofensywna, op = siła defensywna przeciwnika
    const base = 0.42 + (tp - op) * 0.011;
    const keeperBonus = hasGoodKeeper ? -0.07 : 0;
    let g = 0;
    // 8 akcji na mecz
    for(let i = 0; i < 8; i++){
        const chance = Math.max(0.02, Math.min(0.50, base + keeperBonus - i * 0.055));
        if(Math.random() < chance) g += 1;
    }
    // Ograniczenie ekstremalnych wyników
    if(g >= 5 && Math.random() > 0.25) g = 4;
    return Math.max(0, Math.min(6, g));
}
function userTeamBonus(){
    if(!state.lineup || state.lineup.length < 11) return 0;
    
    const avg = state.lineup.reduce((s,p)=>s+p.rating,0) / state.lineup.length;
    const avgFit = state.lineup.reduce((s,p)=>s+(p.fitness||96),0) / state.lineup.length;
    const fitFactor = avgFit<60 ? 0.78 : avgFit<70 ? 0.88 : avgFit<80 ? 0.94 : avgFit<90 ? 0.98 : 1.04;
    
    // Bramkarz ma większe znaczenie
    const gk = state.lineup.find(p => p.position === "BR");
    const gkBonus = gk ? (gk.rating - 70) * 0.06 : -1;
    
    let tacticBonus = 0;
    if(state.tactics.style==="attacking") tacticBonus += 1.0;
    if(state.tactics.style==="counter") tacticBonus += 0.8;
    if(state.tactics.style==="defensive") tacticBonus += 0.2;
    if(state.tactics.style==="possession") tacticBonus += 0.5;
    if(state.tactics.pressing==="high") tacticBonus += 0.5;
    if(state.tactics.width==="wide") tacticBonus += 0.25;
    
    return avg * 0.11 * fitFactor + gkBonus + tacticBonus + rand(-1.5, 1.5);
}

function applyResultToTable(fx){const h=getTableRow(fx.homeClubId),a=getTableRow(fx.awayClubId);if(!h||!a)return;h.played+=1;a.played+=1;h.gf+=fx.homeGoals;h.ga+=fx.awayGoals;a.gf+=fx.awayGoals;a.ga+=fx.homeGoals;if(fx.homeGoals>fx.awayGoals){h.won+=1;h.points+=3;a.lost+=1;pushForm(h,"W");pushForm(a,"L");}else if(fx.homeGoals<fx.awayGoals){a.won+=1;a.points+=3;h.lost+=1;pushForm(a,"W");pushForm(h,"L");}else{h.drawn+=1;a.drawn+=1;h.points+=1;a.points+=1;pushForm(h,"D");pushForm(a,"D");}const ltc=state.activeLeagueTable||state.selectedLeagueCode;const lt=state.leagueTables?.[ltc];if(lt)applyResultToTableRaw(lt,fx);}
function applyCardEffects() {
    const toSuspend = [];
    state.lineup.forEach(p => {
        if (!p.yellowCards) p.yellowCards = 0;
        if (!p.redCards) p.redCards = 0;
        if (Math.random() < 0.12) {
            p.yellowCards += 1;
            if (p.yellowCards > 0 && p.yellowCards % 5 === 0) {
                p.suspended = true;
                toSuspend.push(`${p.name} (5. żółta)`);
            }
        }
        if (Math.random() < 0.02) {
            p.redCards += 1;
            p.suspended = true;
            toSuspend.push(`${p.name} (czerwona kartka)`);
        }
    });
    if (toSuspend.length) {
        addNews(`Zawieszenie: ${toSuspend.join(", ")} — pauza w nastepnym meczu.`);
    }
}

function applySquadEffects(myG, opG) {
    const outfield = shuffle(state.lineup.filter(p => p.position !== "BR"));
    const scorers = outfield.slice(0, myG);
    scorers.forEach(p => p.goals += 1);
    const assistPool = outfield.filter(p => !scorers.includes(p));
    assistPool.slice(0, Math.min(myG, assistPool.length)).forEach(p => p.assists = (p.assists || 0) + 1);

    state.lineup.forEach(p => {
        p.matches += 1;
        p.fitness = Math.max(55, p.fitness - rand(6, 14));
        p.morale = clamp(p.morale + (myG > opG ? 3 : myG < opG ? -2 : 0), 55, 99);
    });

    const events = [];
    const usedMins = new Set();
    const pickMin = () => { let m; do { m = rand(1, 93); } while (usedMins.has(m)); usedMins.add(m); return m; };

    scorers.forEach((p, i) => {
        const min = pickMin();
        const assist = assistPool[i];
        const assistStr = assist ? ` (as. ${assist.name.split(" ").pop()})` : "";
        events.push({ min, text: `${min}' GOL — ${p.name.split(" ").pop()}${assistStr}` });
    });

    if (Math.random() < 0.18) {
        const p = state.lineup[rand(0, state.lineup.length - 1)];
        events.push({ min: pickMin(), text: `${p ? p.name.split(" ").pop() : "Zawodnik"} — dobra szansa, ale pudlo` });
    }
    if (Math.random() < 0.12) {
        const p = outfield[rand(0, outfield.length - 1)];
        events.push({ min: pickMin(), text: `${p ? p.name.split(" ").pop() : "Zawodnik"} — żółta kartka` });
    }

    events.sort((a, b) => a.min - b.min);
    const logLines = events.map(e => e.text);
    if (logLines.length === 0) logLines.push("Wynik bez szczegolowych wydarzen.");

    state.matchLog = logLines.concat(state.matchLog).slice(0, 24);

    applyCardEffects();

    state.lineup.forEach(p => {
        if (p.injury) return;
        if (Math.random() < 0.01) {
            const days = rand(7, 42);
            const types = ["Naciągnięcie mięśnia", "Skręcenie kostki", "Kontuzja kolana", "Uraz uda", "Stłuczenie piszczeli"];
            p.injury = { daysLeft: days, type: types[rand(0, types.length - 1)], weeksTotal: Math.ceil(days / 7) };
            p.fitness = Math.max(0, p.fitness - 30);
            addNews(`Kontuzja: ${p.name} — ${p.injury.type} (${Math.ceil(days / 7)} tyg.)`);
        }
    });
}
function pushForm(r,v){r.form.push(v);if(r.form.length>5)r.form.shift();}
function sortTable(){sortTableRaw(state.table);}

function getMatchResultForUser(fx){
    if(!fx||!fx.played||!state.team)return"";
    const isHome=fx.homeClubId===state.team.club_id;
    const myG=isHome?fx.homeGoals:fx.awayGoals;
    const opG=isHome?fx.awayGoals:fx.homeGoals;
    return myG>opG?"win":myG<opG?"loss":"draw";
}
function renderCalendar() {
    const grid=document.getElementById("calendarGrid"),label=document.getElementById("calendarMonthLabel"),agenda=document.getElementById("calendarAgenda");
    if(!grid||!label||!agenda||!state.calendarDate||!state.team)return;
    const vd=new Date(state.calendarDate),y=vd.getFullYear(),m=vd.getMonth();label.textContent=`${MONTHS[m]} ${y}`;
    const first=new Date(y,m,1),last=new Date(y,m+1,0),off=(first.getDay()+6)%7,cells=Math.ceil((off+last.getDate())/7)*7;
    const todayIso=toIsoDate(state.currentDate),selIso=state.calendarTargetDate;
    const html=DAY_NAMES.map((d)=>`<div class="calendar-weekday">${d}</div>`);
    for(let i=0;i<cells;i+=1){const dn=i-off+1;if(dn<1||dn>last.getDate()){html.push('<div class="calendar-cell empty"></div>');continue;}
        const date=new Date(y,m,dn),iso=toIsoDate(date),fx=findFixtureForTeamDate(iso);
        const isToday=iso===todayIso,isSel=selIso===iso,played=Boolean(fx?.played);
        const resultClass=played?getMatchResultForUser(fx):"";
        const opp=fx?getOpponentNamePatched(fx):"",venue=fx?(fx.homeClubId===state.team.club_id?"Dom":"Wyjazd"):"";
        const oppClub=fx?getClub(fx.homeClubId===state.team.club_id?fx.awayClubId:fx.homeClubId):null;
        const crest=oppClub?.logo_url?`<img class="calendar-crest" src="${escapeHtml(oppClub.logo_url)}" alt="" onerror="this.style.display='none'" loading="lazy">`:"";
        const cls=["calendar-cell",isToday?"today":"",isSel?"selected":"",fx?"match":"",played?"played":"",resultClass].filter(Boolean).join(" ");
        const tag=played?'<i class="fi fi-rr-check"></i> Rozegrany':fx?`<i class="fi fi-rr-calendar-arrow-up"></i> ${fixtureRoundLabel(fx)}`:(iso>todayIso?"Wolne":"Minęło");
        const oppLine=fx?`<div class="calendar-opponent">${fx.homeClubId===state.team.club_id?"vs ":"@ "}${crest}${escapeHtml(shortClubNamePatched(opp))}</div>`:`<div class="calendar-empty-note">${iso===todayIso?'<i class="fi fi-br-info"></i> Dzisiaj':"Brak meczu"}</div>`;
        const sub=fx?`<div class="calendar-subtext">${venue} • ${played?`${fx.homeGoals}:${fx.awayGoals}`:'<i class="fi fi-br-arrow-right"></i> Kliknij'}</div>`:`<div class="calendar-subtext">${isSel&&iso>todayIso?'<i class="fi fi-sr-star"></i> Cel':'<i class="fi fi-sr-spinner"></i> Trening'}</div>`;
        html.push(`<div class="${cls}" onclick="skipToDate('${iso}')"><div class="calendar-dayline"><div class="calendar-date">${dn}</div><div class="calendar-tag">${tag}</div></div>${oppLine}${sub}</div>`);
    }
    grid.innerHTML=html.join("");
    const upc=state.fixtures.filter((f)=>(f.homeClubId===state.team.club_id||f.awayClubId===state.team.club_id)&&f.date>=todayIso).slice(0,6);
    agenda.innerHTML=upc.map((f)=>{const opp=getOpponentNamePatched(f);const oc=getClub(f.homeClubId===state.team.club_id?f.awayClubId:f.homeClubId);const side=f.homeClubId===state.team.club_id?"vs":"@";const sum=f.played?`${f.homeGoals}:${f.awayGoals}`:`<i class="fi fi-rr-calendar-arrow-up"></i> ${fixtureRoundLabel(f)}`;const cr=oc?.logo_url?`<img class="calendar-crest" src="${escapeHtml(oc.logo_url)}" alt="" onerror="this.style.display='none'" loading="lazy">`:"";return`<div class="calendar-agenda-item"><div><strong>${escapeHtml(formatDateLong(fromIsoDate(f.date)))}</strong><div>${side} ${cr}${escapeHtml(opp)}</div></div><div class="calendar-subtext">${sum}</div></div>`;}).join("")||`<div class="calendar-subtext">Brak nadchodzących meczów.</div>`;
}

function findFixtureForTeamDate(iso){return state.fixtures.find((f)=>f.date===iso&&(f.homeClubId===state.team?.club_id||f.awayClubId===state.team?.club_id))||null;}
function getOpponentNamePatched(fx){if(!fx||!state.team)return"";const id=fx.homeClubId===state.team.club_id?fx.awayClubId:fx.homeClubId;return clubNameByIdPatched(id);}
function clubNameByIdPatched(id){return getClub(id)?.name||"Nieznany klub";}
function shortClubNamePatched(n){if(!n)return"";const c=String(n).trim();return c.length<=14?c:c.split(" ").slice(0,2).join(" ");}

function changeCalendarMonth(step){state.calendarDate=new Date(state.calendarDate.getFullYear(),state.calendarDate.getMonth()+step,1);renderCalendar();}
function previousMonth(){changeCalendarMonth(-1);}
function nextMonth(){changeCalendarMonth(1);}
function renderSchedule(){const tbody=document.querySelector("#scheduleTable tbody");tbody.innerHTML="";getUserFixtures().forEach((f)=>{const h=getClub(f.homeClubId),a=getClub(f.awayClubId);tbody.innerHTML+=`<tr><td>${fixtureRoundLabel(f)}</td><td>${formatDateLong(fromIsoDate(f.date))}</td><td>${clubCrestHtml(h?.logo_url,h?.name)}${escapeHtml(h?.name||"?")}</td><td style="font-weight:800;">${f.played?`${f.homeGoals}:${f.awayGoals}`:"-:-"}</td><td>${clubCrestHtml(a?.logo_url,a?.name)}${escapeHtml(a?.name||"?")}</td><td>${f.played?'<span class="badge badge-green"><i class="fi fi-rr-check"></i> Rozegrany</span>':f.date===toIsoDate(state.currentDate)?'<span class="badge badge-orange"><i class="fi fi-rr-calendar-arrow-up"></i> Dzisiaj</span>':'<span class="badge badge-blue"><i class="fi fi-rr-calendar-arrow-up"></i> Plan</span>'}</td></tr>`;});}

function renderTable(){const cupSel=document.getElementById("cupTableSelector");if(cupSel&&cupSel.value==="cup"){renderCupTable();return;}const code=state.activeLeagueTable||state.selectedLeagueCode;const tbl=state.leagueTables[code]||state.table;const tbody=document.querySelector("#leagueTable tbody");if(!tbody)return;tbody.innerHTML="";const zones=getLeagueZones(code,tbl);tbl.forEach((r,i)=>{const z=zones.get(i+1);const isUser=r.clubId===state.team.club_id;const cls=[isUser?"my-team":"",z?.rowClass||""].filter(Boolean).join(" ");const posCls=z?.rowClass||"pos-normal";const form=r.form.map((v)=>FORM_ICON[v]||v).join(" ");const crest=clubCrestHtml(r.logo_url,r.name);const teamBg=!isUser&&r.color?` style="background:linear-gradient(90deg,${r.color}18,transparent 50%);"`:"";tbody.innerHTML+=`<tr class="${cls}"${teamBg}><td><span class="pos ${posCls}">${i+1}</span></td><td>${crest}${escapeHtml(r.name)}</td><td>${r.played}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gf-r.ga}</td><td style="font-weight:800;color:var(--primary-light);">${r.points}</td><td>${z?`<span class="zone-chip ${z.className}">${escapeHtml(z.label)}</span>`:"-"}</td><td>${form}</td></tr>`;});const e=document.getElementById("tableMatchDay");if(e)e.textContent=`Po ${(state.leagueTables[code]&&state.leagueTables[code][0]?.played)||0} kolejkach`;renderOtherLeaguePreviews();}

function renderOtherLeaguePreviews(){const cont=document.getElementById("otherLeaguesPreview");if(!cont||!state.allLeagueData){if(cont)cont.innerHTML="";return;}const toShow=Object.entries(state.allLeagueData).filter(([c])=>c!==state.selectedLeagueCode).slice(0,4);cont.innerHTML=toShow.map(([code,league])=>{const tbl=state.leagueTables[code]||[];const top3=tbl.slice(0,3);return`<div class="card" style="margin:0;padding:1rem;"><div class="card-header" style="margin-bottom:0.5rem;padding-bottom:0.5rem;"><h3>${escapeHtml(league.name)}</h3></div>${top3.map((r,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:0.2rem 0;font-size:0.85rem;"><span>${i+1}. ${clubCrestHtml(r.logo_url,r.name,"club-crest-sm")}${escapeHtml(r.name)}</span><span style="font-weight:700;">${r.points} pkt</span></div>`).join("")||"<div style='font-size:0.85rem;color:var(--text-muted);'>Brak danych</div>"}</div>`;}).join("");}

async function fillLeagueTableSelector(){const sel=document.getElementById("leagueTableSelector");if(!sel)return;if(state.allLeagueData){sel.innerHTML=Object.entries(state.allLeagueData).map(([code,league])=>`<option value="${escapeHtml(code)}" ${code===state.selectedLeagueCode?"selected":""}>${escapeHtml(league.name)}</option>`).join("");}else{sel.innerHTML=`<option value="${escapeHtml(state.selectedLeagueCode)}">${escapeHtml(state.leagueData.name)}</option>`;}state.activeLeagueTable=state.selectedLeagueCode;}
function switchLeagueTable(){const cupSel=document.getElementById("cupTableSelector");if(cupSel)cupSel.value="";state.activeLeagueTable=document.getElementById("leagueTableSelector")?.value||state.selectedLeagueCode;renderTable();const league=state.allLeagueData?.[state.activeLeagueTable];if(league)updateNav(league.name);}

function renderEuropeanCupTable(cupCode){
    const tbody = document.querySelector("#leagueTable tbody");
    if(!tbody) return;
    const e = document.getElementById("tableMatchDay");
    const cup = UEFA_CUPS[cupCode];
    if(!cup) return;
    const tbl = buildEuropeanTable(cupCode);
    if(e) e.textContent = cup.name;
    let html = '';
    tbl.forEach((r,i) => {
        const pos = i+1;
        const isUser = String(r.club_id) === String(state.team?.club_id);
        let posBg = '', posColor = 'var(--muted)';
        if(pos <= 8){ posBg = 'background:rgba(16,185,129,.1);'; posColor = '#10b981'; }
        else if(pos <= 24){ posBg = 'background:rgba(245,158,11,.08);'; posColor = '#f59e0b'; }
        else { posBg = 'background:rgba(239,68,68,.06);'; posColor = '#ef4444'; }
        if(isUser) posBg = 'background:rgba(37,99,235,.2);';
        const nameStyle = isUser ? 'color:#93c5fd;font-weight:800;' : 'color:#fff;font-weight:600;';
        const badge = isUser ? ' <span style="background:var(--primary);color:#fff;font-size:.6rem;padding:2px 6px;border-radius:4px;margin-left:.4rem;">TY</span>' : '';
        const form = (r.form||[]).slice(-5).map(v => FORM_ICON[v]||v).join(' ') || '-';
        const gd = r.gf - r.ga;
        const gdColor = gd > 0 ? '#10b981' : gd < 0 ? '#ef4444' : 'var(--muted)';
        html += '<tr style="' + posBg + 'border-bottom:1px solid rgba(255,255,255,.03);"><td style="padding:.55rem .4rem;text-align:center;font-weight:900;color:' + posColor + ';font-size:.9rem;">' + pos + '</td><td style="padding:.55rem .4rem;text-align:left;' + nameStyle + '">' + clubCrestHtml(r.logo_url,r.name,"club-crest-sm") + escapeHtml(r.name) + badge + '</td><td style="padding:.55rem .4rem;text-align:center;color:var(--muted);">' + r.played + '</td><td style="padding:.55rem .4rem;text-align:center;color:#10b981;font-weight:700;">' + r.won + '</td><td style="padding:.55rem .4rem;text-align:center;color:#9ca3af;font-weight:700;">' + r.drawn + '</td><td style="padding:.55rem .4rem;text-align:center;color:#ef4444;font-weight:700;">' + r.lost + '</td><td style="padding:.55rem .4rem;text-align:center;color:var(--muted);">' + r.gf + '</td><td style="padding:.55rem .4rem;text-align:center;color:var(--muted);">' + r.ga + '</td><td style="padding:.55rem .4rem;text-align:center;font-weight:800;color:' + gdColor + ';">' + (gd>0?'+':'') + gd + '</td><td style="padding:.55rem .4rem;text-align:center;font-weight:800;color:var(--primary-light);">' + r.points + '</td><td style="padding:.55rem .4rem;text-align:center;font-size:.78rem;white-space:nowrap;">' + form + '</td></tr>';
    });
    tbody.innerHTML = html;
    const legend = document.getElementById('tableLegend');
    if(legend){
        legend.innerHTML = '<span><span class="leg-box promo"></span>1-8: Awans do 1/8</span><span><span class="leg-box playoff"></span>9-24: Baraż</span><span><span class="leg-box releg"></span>25-36: Odpadnięcie</span>';
    }
}

function switchCupTable(){
    const cupSel=document.getElementById("cupTableSelector");
    const val = cupSel.value;
    if(val === 'cup' || val === 'UCL' || val === 'UEL' || val === 'UECL'){
        renderCupTable();
        updateNav(val === 'cup' ? 'Puchary' : UEFA_CUPS[val]?.name || val);
    } else {
        switchLeagueTable();
    }
}

function renderCupTable(){
    const tbody=document.querySelector("#leagueTable tbody");
    if(!tbody)return;
    const e=document.getElementById("tableMatchDay");
    if(e)e.textContent="";
    tbody.innerHTML=`<tr><td colspan="12" style="text-align:center;color:var(--muted);padding:3rem 1rem;">
        <div style="font-size:2.5rem;margin-bottom:1rem;">🏆</div>
        <div style="font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:.5rem;">Puchar Krajowy</div>
        <p style="margin:0;line-height:1.6;">Drabinka pucharowa będzie dostępna w przyszłej aktualizacji.</p>
    </td></tr>`;
}

async function saveCareer(){if(!state.team)return;try{const payload=serializeState();await apiPost("/api/save",payload);const label=state.coachName?`${state.coachName} - ${state.team.name}`:state.team.name;state.saveStatus=` Zapisano: ${label}`;}catch(e){state.saveStatus=` Błąd zapisu: ${e.message}`;}updateSaveStatus();}
async function loadCareer(){let p;try{p=await apiGet("/api/save");}catch(e){state.saveStatus=" Błąd ładowania: serwer nie odpowiada.";updateSaveStatus();return;}if(!p||!p.exists){state.saveStatus=" Brak zapisu na serwerze.";updateSaveStatus();return;}if(!p.state){state.saveStatus=" Uszkodzony zapis.";updateSaveStatus();return;}try{await applySavedState(p.state);}catch(e){state.saveStatus=" Błąd wczytywania: "+e.message;updateSaveStatus();return;}if(!state.uefaData){try{const u=await apiGet("/api/uefa");state.uefaData=u;if(u&&u.rankings){state.uefaPoints={};u.rankings.forEach(r=>{state.uefaPoints[r.competition_code]=r.coefficient;});}}catch(e){}}}
function serializeState(){return{selectedLeagueCode:state.selectedLeagueCode,teamId:state.team.club_id,coachName:state.coachName||"",currentDate:toIsoDate(state.currentDate),calendarDate:toIsoDate(state.calendarDate),budgetMillions:state.budgetMillions,wageBudgetMillions:state.wageBudgetMillions,formation:state.formation,tactics:state.tactics,seasonFinished:state.seasonFinished,transferWindow:state.transferWindow,europeanEntry:state.europeanEntry||null,europeanOpponents:state.europeanOpponents||[],uclLeague:state.uclLeague||null,uclKnockout:state.uclKnockout||null,players:state.players,lineupIds:state.lineup.map((p)=>p.id),benchIds:state.bench.map((p)=>p.id),table:state.table,fixtures:state.fixtures,results:state.results,news:state.news,matchLog:state.matchLog,leagueTables:state.leagueTables,leagueFixtures:state.leagueFixtures,uefaData:state.uefaData,uefaPoints:state.uefaPoints,trainingFocus:state.trainingFocus||null,trainingLog:state.trainingLog||[],currentMatch:state.currentMatch||null};}

async function applySavedState(snapshot){const ld=deepClone(await loadLeague(snapshot.selectedLeagueCode));state.selectedLeagueCode=snapshot.selectedLeagueCode;state.leagueData=ld;state.allTeams=ld.clubs;state.team=ld.clubs.find((c)=>c.club_id===String(snapshot.teamId))||ld.clubs[0];state.coachName=snapshot.coachName||"";state.players=snapshot.players;state.formation=snapshot.formation||"4-3-3";state.tactics=snapshot.tactics||{style:"balanced",pressing:"medium",width:"normal"};state.budgetMillions=snapshot.budgetMillions;state.wageBudgetMillions=snapshot.wageBudgetMillions;state.currentDate=fromIsoDate(snapshot.currentDate);state.calendarDate=fromIsoDate(snapshot.calendarDate);state.seasonFinished=!!snapshot.seasonFinished;state.transferWindow=snapshot.transferWindow||null;state.europeanEntry=snapshot.europeanEntry||null;state.europeanOpponents=snapshot.europeanOpponents||[];state.uclLeague=snapshot.uclLeague||null;state.uclKnockout=snapshot.uclKnockout||null;state.table=snapshot.table;state.fixtures=snapshot.fixtures;state.results=snapshot.results;state.news=snapshot.news;state.matchLog=snapshot.matchLog;state.lineup=snapshot.lineupIds.map((id)=>state.players.find((p)=>p.id===id)).filter(Boolean);state.bench=snapshot.benchIds.map((id)=>state.players.find((p)=>p.id===id)).filter(Boolean);if(snapshot.leagueTables)state.leagueTables=snapshot.leagueTables;if(snapshot.leagueFixtures)state.leagueFixtures=snapshot.leagueFixtures;if(snapshot.uefaData)state.uefaData=snapshot.uefaData;if(snapshot.uefaPoints)state.uefaPoints=snapshot.uefaPoints;state.trainingFocus=snapshot.trainingFocus||null;state.trainingLog=snapshot.trainingLog||[];state.currentMatch=snapshot.currentMatch||null;
    // Szybkie renderowanie przed załadowaniem transferów
    renderFormationButtons();updateTacticsInputs();updateNav();await fillLeagueTableSelector();renderAll();
    document.getElementById("startScreen").style.display="none";document.getElementById("teamSelect").style.display="none";
    // Transfery i ligi w tle
    state._transfersLoaded = false;
    prepareTransferPool().then(()=>{fillTransferFilterOptions();renderTransfers();}).catch(()=>{});
    if(!state.allLeagueData){loadAllLeagues().then(d=>{state.allLeagueData=d;if(!snapshot.leagueTables){initAllLeagueTables();generateAllLeagueFixtures(2025);}fillLeagueTableSelector();renderTable();}).catch(()=>{});}
}

async function loadGameFromFile(event){const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=async(e)=>{try{const data=JSON.parse(e.target.result);const container=document.getElementById("gameContainer");if(container&&!container.innerHTML.trim()){const resp=await fetch("./career.html");if(!resp.ok)throw new Error("Błąd ładowania szablonu ("+resp.status+")");container.innerHTML=await resp.text();container.style.display="block";injectGameplayStyles();}await applySavedState(data);state.saveStatus=` Wczytano z pliku: ${file.name}`;updateSaveStatus();}catch(err){state.saveStatus=` Błąd: ${err.message}`;updateSaveStatus();}};reader.readAsText(file);event.target.value="";}

const YOUTH_NAMES = {first:["Jakub","Kacper","Mateusz","Bartosz","Szymon","Filip","Antoni","Michał","Jan","Adam","Piotr","Mikołaj","Tomasz","Konrad","Dawid","Krzysztof","Łukasz","Wojciech","Rafał","Patryk","Marcin","Grzegorz","Igor","Artur"],last:["Kowalski","Wiśniewski","Kamiński","Lewandowski","Zieliński","Adamczyk","Krawczyk","Nowak","Jankowski","Kwiatkowski","Pawlak","Michalak","Sadowski","Wójcik","Baran","Kozłowski","Woźniak","Szymański","Dąbrowski","Mazurek","Kubiak","Pietrzak","Czarnecki","Ostrowski","Malinowski","Jabłoński","Kruk","Gajewski","Stępień","Tomczak"]};
function agePlayers(){
    const retired = [];
    state.players.forEach(p => {
        if (p.age) p.age += 1;
        const age = p.age, pot = p.potential || 0;
        const rating = p.rating || 50;
        if (age > 32) {
            const decline = Math.min(age - 32, 10);
            const loss = Math.floor(decline * 0.4 + Math.random() * 0.3);
            p.rating = Math.max(25, rating - loss);
            if (p.rating_base > p.rating) p.rating_base = p.rating;
        } else if (age >= 25) {
            if (Math.random() < 0.12 && pot > 0) {
                p.rating = Math.min(99, rating + 1);
                p.potential = Math.max(0, pot - 1);
            }
        } else {
            const growthChance = Math.max(0.05, 0.95 - (age - 16) * 0.07);
            const maxGrowth = Math.max(1, Math.floor((24 - age) / 3) + 1);
            if (Math.random() < growthChance && pot > 0) {
                const gain = Math.min(maxGrowth, pot);
                p.rating = Math.min(99, rating + gain);
                p.potential = Math.max(0, pot - gain);
            }
        }
        if (p.potential > 0 && age > 28) {
            const decay = Math.max(0, p.potential - Math.floor((age - 28) * 0.3));
            p.potential = decay;
            p.rating_potential = decay;
        }
        if (age >= 40 || p.rating < 28) retired.push(p);
    });
    if (retired.length > 0) {
        const ids = new Set(retired.map(p => p.id));
        state.players = state.players.filter(p => !ids.has(p.id));
        state.lineup = state.lineup.filter(p => !ids.has(p.id));
        state.bench = state.bench.filter(p => !ids.has(p.id));
        state.reserves = state.reserves.filter(p => !ids.has(p.id));
        addNews(` Emerytura: ${retired.map(p => p.name).join(', ')} zakończyli karierę.`);
        generateYouthPlayers(retired.length);
    }

    const expiring = [], expired = [];
    state.players.forEach(p => {
        if (typeof p.contractYears !== "number") p.contractYears = rand(1, 3);
        p.contractYears -= 1;
        if (p.contractYears <= 0) expired.push(p);
        else if (p.contractYears === 1) expiring.push(p.name);
    });

    if (expiring.length) {
        addNews(`Kontrakt wygasa za rok: ${expiring.join(", ")} — rozważ przedluzenie.`);
    }
    if (expired.length) {
        const ids = new Set(expired.map(p => p.id));
        state.players  = state.players.filter(p => !ids.has(p.id));
        state.lineup   = state.lineup.filter(p => !ids.has(p.id));
        state.bench    = state.bench.filter(p => !ids.has(p.id));
        state.reserves = (state.reserves || []).filter(p => !ids.has(p.id));
        addNews(`Koniec kontraktu: ${expired.map(p => p.name).join(", ")} odchodzi jako wolny agent.`);
        autoPick();
    }
}
function generateYouthPlayers(count){
    const positions=["BR","OB","PO","NA"];
    const posWeights=[1,3,4,2];
    const totalW=posWeights.reduce((a,b)=>a+b,0);
    const gen=()=>{
        const name=`${YOUTH_NAMES.first[rand(0,YOUTH_NAMES.first.length-1)]} ${YOUTH_NAMES.last[rand(0,YOUTH_NAMES.last.length-1)]}`;
        let r=rand(0,totalW-1),posIdx=0;
        for(let i=0;i<posWeights.length;i++){r-=posWeights[i];if(r<0){posIdx=i;break;}}
        const pos=positions[posIdx];
        const age=16+rand(0,4);
        const rating=clamp(rand(40,65)+rand(-3,3),40,75);
        const baseV=rating<50?rand(50,300):rating<60?rand(200,800):rand(500,2000);
        const nid=state.players.reduce((m,p)=>Math.max(m,Number(p.id)||0),0)+1+state._youthCnt;
        return{id:nid,name,position:pos,age,rating,rating_base:Math.max(30,rating-rand(3,8)),rating_experience:0,rating_potential:rand(2,5),potential:rand(2,5),fitness:rand(80,99),morale:rand(60,90),valueMillions:round2(baseV/1e6),wageMillions:round2(baseV/1e6*0.04),market_value_eur:baseV*1000,matches:0,goals:0,assists:0};
    };
    if(!state._youthCnt)state._youthCnt=0;
    for(let i=0;i<count;i++){const y=gen();state._youthCnt++;state.players.push(y);state.reserves.push(y);}
    addNews(` Akademia: ${count} nowych młodzików dołączyło do klubu.`);
}

function getLeagueConfig(code = state.selectedLeagueCode) {
    const key = String(code || "").toUpperCase();
    const fromSelected = state.leagueData && String(state.leagueData.competition_code || "").toUpperCase() === key ? state.leagueData : null;
    const fromAll = state.allLeagueData?.[key];
    const source = fromSelected || fromAll;
    if (source) {
        return {
            code: key,
            name: source.name || key,
            label: source.label || source.name || key,
            tier: Number(source.tier || 4),
            level: Number(source.level || 1),
            startBudget: Number(source.startBudget || 8),
            rules: source.rules || {},
        };
    }
    return { code: key, name: key, label: key || "Liga", tier: 4, level: 1, startBudget: 8, rules: {} };
}

function getLeagueTier() {
    const cfg = getLeagueConfig();
    return { tier: cfg.tier || 4, startBudget: cfg.startBudget || 8, label: cfg.label || cfg.name || "Liga" };
}

function getCounterpartLeague(code, direction) {
    const upper = code.toUpperCase();
    const cfg = getLeagueConfig(upper);
    if (cfg?.rules && cfg.rules[direction]) return cfg.rules[direction];
    const ends1 = upper.endsWith("1");
    const ends2 = upper.endsWith("2");
    const overrides = {
        "GR1": { up: null, down: "GRS2" },
        "GRS2": { up: "GR1", down: null },
    };
    if (overrides[upper]) return overrides[upper][direction];
    if (direction === "up" && ends2) {
        const cand = upper.slice(0, -1) + "1";
        if (state.allLeagueData && state.allLeagueData[cand]) return cand;
    }
    if (direction === "down" && ends1) {
        const cand = upper.slice(0, -1) + "2";
        if (state.allLeagueData && state.allLeagueData[cand]) return cand;
    }
    return null;
}

// --- TRENINGI ---
const TRAINING_MODES = {
    balanced:  { label: "Zrównoważony",     desc: "Ogólny rozwój — kondycja i morale." },
    physical:  { label: "Fizyczny",         desc: "Maksymalna poprawa kondycji zawodników." },
    technical: { label: "Techniczny",       desc: "Młodzież (do 25 lat) zyskuje oceny szybciej." },
    tactical:  { label: "Taktyczny",        desc: "Boost morale i drużyna gra bardziej zgranie." },
    youth:     { label: "Akademia",         desc: "Rezerwy poniżej 21 lat rozwijają się szybciej." },
    recovery:  { label: "Regeneracja",      desc: "Wszyscy szybko wracają do pełnej kondycji." },
};

function setTrainingFocus(mode) {
    state.trainingFocus = mode;
    document.querySelectorAll(".training-mode-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.mode === mode));
    addNews(`Trening: zmieniono plan na "${TRAINING_MODES[mode]?.label || mode}".`);
}

function applyTrainingEffects(hadFixture) {
    if (hadFixture) return;
    const mode = state.trainingFocus || "balanced";
    const allActive = [...state.lineup, ...state.bench];
    let logText = "";

    switch (mode) {
        case "physical":
            allActive.forEach(p => { p.fitness = Math.min(99, (p.fitness || 90) + rand(2, 4)); });
            logText = "Trening fizyczny: poprawa kondycji.";
            break;
        case "technical":
            allActive.filter(p => (p.age || 30) <= 25 && (p.potential || 0) > 0).forEach(p => {
                if (Math.random() < 0.03) { p.rating = Math.min(99, p.rating + 1); p.potential = Math.max(0, p.potential - 1); logText = `Trening tech.: ${p.name} poprawił ocenę.`; }
            });
            if (!logText) logText = "Trening techniczny — brak wzrostów dzisiaj.";
            break;
        case "tactical":
            allActive.forEach(p => { p.morale = Math.min(99, (p.morale || 75) + rand(1, 3)); });
            logText = "Trening taktyczny: morale wzrosło.";
            break;
        case "youth":
            (state.reserves || []).filter(p => (p.age || 30) <= 21 && (p.potential || 0) > 0).forEach(p => {
                if (Math.random() < 0.05) { p.rating = Math.min(99, p.rating + 1); p.potential = Math.max(0, p.potential - 1); }
            });
            logText = "Akademia: sesja z młodzieżowcami.";
            break;
        case "recovery":
            state.players.forEach(p => {
                p.fitness = Math.min(99, (p.fitness || 90) + rand(4, 8));
                if (p.injury) p.injury.daysLeft = Math.max(0, p.injury.daysLeft - 2);
            });
            logText = "Regeneracja: kondycja drużyny odbudowana.";
            break;
        default:
            allActive.forEach(p => {
                p.fitness = Math.min(99, (p.fitness || 90) + rand(1, 2));
                p.morale  = Math.min(99, (p.morale  || 75) + rand(0, 1));
            });
            logText = "Trening: standard.";
    }

    if (logText) {
        state.trainingLog = state.trainingLog || [];
        state.trainingLog.unshift({ date: toIsoDate(state.currentDate), text: logText });
        if (state.trainingLog.length > 20) state.trainingLog.pop();
    }
}

function renderTrainingLog() {
    const el = document.getElementById("trainingLogMini");
    if (!el) return;
    const log = state.trainingLog || [];
    el.innerHTML = log.slice(0, 8).map(l =>
        `<div><span style="color:rgba(255,255,255,.3);margin-right:.4rem;">${l.date}</span>${escapeHtml(l.text)}</div>`
    ).join("") || "<div>Brak historii treningów.</div>";

    const badge = document.getElementById("trainingModeBadge");
    if (badge) badge.textContent = TRAINING_MODES[state.trainingFocus]?.label || state.trainingFocus;
    document.querySelectorAll(".training-mode-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.mode === state.trainingFocus));
}

// --- KONIEC SEZONU ---

function formatDateShort(iso){
    const d = fromIsoDate(iso);
    return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)}`;
}
// getEuropeanQualification, applyEuropeanResult

function computeMoveCounts(nUpper, nLower) {
    const direct = Math.max(1, Math.min(
        Math.floor(nUpper * 0.12),
        Math.floor(nLower * 0.12),
        Math.floor((nUpper - 4) / 2),
        Math.floor((nLower - 4) / 2)
    ));
    const hasPlayoff = nUpper >= 10 && nLower >= 6;
    return { directMove: direct, hasPlayoff };
}

function getLeagueRule(code, nThis=18, nPartner=18) {
    const key = String(code || "").toUpperCase();
    const rule = getLeagueConfig(key).rules || {};
    if (Object.keys(rule).length) return { promotion:0, relegation:0, playoffPromotion:[], playoffRelegation:0, ...rule };
    const up = getCounterpartLeague(key, "up");
    const down = getCounterpartLeague(key, "down");
    const fallback = computeMoveCounts(nThis, nPartner);
    return {
        up, down,
        promotion: up ? fallback.directMove : 0,
        relegation: down ? fallback.directMove : 0,
        playoffPromotion: up && fallback.hasPlayoff ? [fallback.directMove + 1] : [],
        playoffRelegation: down && fallback.hasPlayoff ? 1 : 0,
    };
}

function getPlayoffPromotionCount(rule) {
    return Array.isArray(rule.playoffPromotion) ? rule.playoffPromotion.length : Number(rule.playoffPromotion || 0);
}

function getLeagueZones(code, tbl) {
    const n = tbl?.length || 0;
    const zones = [];
    const isTop = !getCounterpartLeague(code, "up");
    if (isTop) {
        const uefa = getUefaForLeague(code);
        let s = 1;
        if (uefa?.ucl_spots) { for (let p=s; p<s+uefa.ucl_spots; p++) zones.push({pos:p,label:"LM",className:"zone-ucl",rowClass:"pos-promo"}); s += uefa.ucl_spots; }
        if (uefa?.uel_spots) { for (let p=s; p<s+uefa.uel_spots; p++) zones.push({pos:p,label:"LE",className:"zone-uel",rowClass:"pos-promo"}); s += uefa.uel_spots; }
        if (uefa?.uecl_spots) { for (let p=s; p<s+uefa.uecl_spots; p++) zones.push({pos:p,label:"LK",className:"zone-uecl",rowClass:"pos-promo"}); }
    }
    const partnerCode = getCounterpartLeague(code, "down") || getCounterpartLeague(code, "up");
    const partnerN = partnerCode && state.leagueTables?.[partnerCode] ? state.leagueTables[partnerCode].length : n;
    const rule = getLeagueRule(code, n, partnerN);
    for (let p=1; p<=Number(rule.promotion || 0); p++) zones.push({pos:p,label:"Awans",className:"zone-promo",rowClass:"pos-promo"});
    const playoffPositions = Array.isArray(rule.playoffPromotion) ? rule.playoffPromotion : [];
    playoffPositions.forEach(p => zones.push({pos:p,label:"Baraż o awans",className:"zone-playoff",rowClass:"pos-promo"}));
    for (let i=0; i<Number(rule.playoffRelegation || 0); i++) zones.push({pos:n-Number(rule.relegation || 0)-i,label:"Baraż o utrzymanie",className:"zone-playoff",rowClass:"pos-releg"});
    for (let i=0; i<Number(rule.relegation || 0); i++) zones.push({pos:n-i,label:"Spadek",className:"zone-releg",rowClass:"pos-releg"});
    const byPos = new Map();
    zones.forEach(z => { if (z.pos >= 1 && z.pos <= n && !byPos.has(z.pos)) byPos.set(z.pos, z); });
    return byPos;
}

async function applyAllPromotionsRelegations() {
    if (!state.allLeagueData) return {};
    const processed = new Set();
    const userClubId = String(state.team.club_id);
    let barazMsg = null;

    const sortFn = (a, b) =>
        (b.points - a.points) ||
        ((b.gf - b.ga) - (a.gf - a.ga)) ||
        (b.gf - a.gf) ||
        a.name.localeCompare(b.name, 'pl');

    for (const code of Object.keys(state.leagueTables)) {
        if (processed.has(code)) continue;

        const partnerCode = getCounterpartLeague(code, 'down') || getCounterpartLeague(code, 'up');
        if (!partnerCode || !state.leagueTables[partnerCode]) continue;
        if (processed.has(partnerCode)) continue;

        processed.add(code);
        processed.add(partnerCode);

        const [upperCode, lowerCode] = code.endsWith('1')
            ? [code, partnerCode]
            : [partnerCode, code];

        const upperTbl  = state.leagueTables[upperCode];
        const lowerTbl  = state.leagueTables[lowerCode];
        const upperData = state.allLeagueData[upperCode];
        const lowerData = state.allLeagueData[lowerCode];
        if (!upperTbl || !lowerTbl || !upperData || !lowerData) continue;

        const nU = upperTbl.length;
        const nL = lowerTbl.length;
        const upperRule = getLeagueRule(upperCode, nU, nL);
        const lowerRule = getLeagueRule(lowerCode, nL, nU);
        const directRelegation = Math.min(Number(upperRule.relegation || 0), Math.max(0, nU - 1));
        const directPromotion = Math.min(Number(lowerRule.promotion || 0), Math.max(0, nL - 1));
        const playoffRelegation = Math.min(Number(upperRule.playoffRelegation || 0), Math.max(0, nU - directRelegation));
        const playoffPromotionPositions = (Array.isArray(lowerRule.playoffPromotion) ? lowerRule.playoffPromotion : [])
            .filter(p => p >= 1 && p <= nL);

        const sortedU = [...upperTbl].sort(sortFn);
        const sortedL = [...lowerTbl].sort(sortFn);

        const relegateIds = sortedU.slice(nU - directRelegation).map(r => String(r.clubId));
        const promoteIds  = sortedL.slice(0, directPromotion).map(r => String(r.clubId));
        const playoffLowerRows = playoffPromotionPositions.map(p => sortedL[p-1]).filter(Boolean);
        let lowerPlayoffWinner = null;
        if (playoffLowerRows.length) {
            lowerPlayoffWinner = playoffLowerRows.reduce((best,row)=>{
                if(!best) return row;
                const rowClub = lowerData.clubs.find(c => String(c.club_id) === String(row.clubId));
                const bestClub = lowerData.clubs.find(c => String(c.club_id) === String(best.clubId));
                const rowScore = (rowClub?.avg_rating || 60) + rand(-5,5) + row.points * 0.05;
                const bestScore = (bestClub?.avg_rating || 60) + rand(-5,5) + best.points * 0.05;
                return rowScore >= bestScore ? row : best;
            }, null);
            addNews(`Baraże o awans (${lowerData.name || lowerCode}): wygrywa ${lowerPlayoffWinner.name}.`);
        }

        if (playoffRelegation > 0 && lowerPlayoffWinner) {
            const barazU = sortedU[nU - directRelegation - 1];
            const barazL = lowerPlayoffWinner;

            if (barazU && barazL) {
                const uId = String(barazU.clubId);
                const lId = String(barazL.clubId);
                const userInUpper = uId === userClubId;
                const userInLower = lId === userClubId;

                let upperSurvives;

                if (userInUpper || userInLower) {
                    // Baraż z udziałem gracza — używamy siły składu
                    const userStr = state.lineup.reduce((s, p) => s + p.rating, 0)
                        / Math.max(1, state.lineup.length);
                    const oppClubData = userInUpper
                        ? lowerData.clubs.find(c => String(c.club_id) === lId)
                        : upperData.clubs.find(c => String(c.club_id) === uId);
                    const oppStr = oppClubData?.avg_rating || 65;

                    // Drużyna z wyższej ligi gra u siebie (przewaga)
                    const isHome = userInUpper;
                    const ha = isHome ? 2 : 0;
                    const uG = calculateGoals(userStr * 0.11 + ha + rand(-3, 3), oppStr * 0.09 + rand(-3, 3));
                    const oG = calculateGoals(oppStr * 0.09 + rand(-3, 3), userStr * 0.11 + ha + rand(-3, 3));

                    const oppName = userInUpper ? barazL.name : barazU.name;
                    const score = `${uG}:${oG}`;

                    if (userInUpper) {
                        upperSurvives = uG >= oG;
                        barazMsg = upperSurvives
                            ? `Baraż o utrzymanie: ${state.team.name} utrzymuje się z ${oppName} ${score}.`
                            : `Baraż o utrzymanie: ${state.team.name} przegrywa z ${oppName} ${score} i spada.`;
                    } else {
                        upperSurvives = uG <= oG;
                        const userWins = !upperSurvives;
                        barazMsg = userWins
                            ? `Baraż o awans: ${state.team.name} wygrywa z ${oppName} ${uG}:${oG} i awansuje!`
                            : `Baraż o awans: ${state.team.name} przegrywa z ${oppName} ${uG}:${oG}.`;
                    }
                } else {
                    // AI vs AI
                    const uClub = upperData.clubs.find(c => String(c.club_id) === uId);
                    const lClub = lowerData.clubs.find(c => String(c.club_id) === lId);
                    const hs = (uClub?.avg_rating || 65) + rand(-6, 6) + 2;
                    const as = (lClub?.avg_rating  || 60) + rand(-6, 6);
                    const hG = calculateGoals(hs, as);
                    const aG = calculateGoals(as, hs);
                    upperSurvives = hG >= aG;
                    const winner = upperSurvives ? barazU.name : barazL.name;
                    addNews(`Baraż: ${barazU.name} ${hG}:${aG} ${barazL.name} — ${winner} wygrywa.`);
                }

                if (!upperSurvives) {
                    relegateIds.push(uId);
                    promoteIds.push(lId);
                }
            }
        } else if (lowerPlayoffWinner && !promoteIds.includes(String(lowerPlayoffWinner.clubId))) {
            promoteIds.push(String(lowerPlayoffWinner.clubId));
        }

        // Zastosuj awanse (z niższej do wyższej)
        for (const cid of promoteIds) {
            const ci = lowerData.clubs.findIndex(c => String(c.club_id) === cid);
            if (ci >= 0) {
                const [club] = lowerData.clubs.splice(ci, 1);
                upperData.clubs.push(club);
            }
            const ri = lowerTbl.findIndex(r => String(r.clubId) === cid);
            if (ri >= 0) {
                const [row] = lowerTbl.splice(ri, 1);
                upperTbl.push({ ...row, played:0, won:0, drawn:0, lost:0, gf:0, ga:0, points:0, form:[] });
            }
        }

        // Zastosuj spadki (z wyższej do niższej)
        for (const cid of relegateIds) {
            const ci = upperData.clubs.findIndex(c => String(c.club_id) === cid);
            if (ci >= 0) {
                const [club] = upperData.clubs.splice(ci, 1);
                lowerData.clubs.push(club);
            }
            const ri = upperTbl.findIndex(r => String(r.clubId) === cid);
            if (ri >= 0) {
                const [row] = upperTbl.splice(ri, 1);
                lowerTbl.push({ ...row, played:0, won:0, drawn:0, lost:0, gf:0, ga:0, points:0, form:[] });
            }
        }
    }

    return { barazMsg };
}

function getSeasonOutcome() {
    const tbl = state.table;
    const pos = tbl.findIndex(r => r.clubId === state.team.club_id);
    const n   = tbl.length;
    const tier  = getLeagueTier().tier;
    const scale = tier === 1 ? 5 : tier === 2 ? 2.5 : tier === 3 ? 1.5 : 1;
    const BC = v => round2(v * scale);

    const partnerDown = getCounterpartLeague(state.selectedLeagueCode, 'down');
    const partnerUp   = getCounterpartLeague(state.selectedLeagueCode, 'up');
    const partnerCode = partnerDown || partnerUp;
    const nPartner    = partnerCode && state.leagueTables[partnerCode]
        ? state.leagueTables[partnerCode].length
        : n;

    const rule = getLeagueRule(state.selectedLeagueCode, n, nPartner);
    const europe = getEuropeanQualification();

    // Mistrz najwyższej ligi
    if (!partnerUp && pos === 0)
        return { type:'champion',      label:'MISTRZ LIGI',          color:'#fbbf24', budget: BC(15), europe };

    // Bezposredni awans (tylko gdy jest liga wyzej)
    if (partnerUp && pos < Number(rule.promotion || 0))
        return { type:'promoted',      label:'AWANS BEZPOŚREDNI',    color:'#10b981', budget: BC(9),  europe };

    // Baraż o awans (tylko gdy jest liga wyżej)
    if (partnerUp && (rule.playoffPromotion || []).includes(pos + 1))
        return { type:'playoff_promo', label:'BARAŻ O AWANS',        color:'#06b6d4', budget: BC(4),  europe: null };

    // Bezpośredni spadek (tylko gdy jest liga niżej)
    if (partnerDown && pos >= n - Number(rule.relegation || 0))
        return { type:'relegated',     label:'SPADEK BEZPOŚREDNI',   color:'#ef4444', budget: BC(-7), europe: null };

    // Baraż o utrzymanie (tylko gdy jest liga niżej)
    if (partnerDown && pos >= n - Number(rule.relegation || 0) - Number(rule.playoffRelegation || 0) && pos < n - Number(rule.relegation || 0))
        return { type:'playoff_releg', label:'BARAŻ O UTRZYMANIE',   color:'#f59e0b', budget: BC(1),  europe: null };

    // Srodek tabeli
    return { type:'mid', label:`MIEJSCE ${pos + 1}`, color:'#9ca3af', budget: BC(2), europe };
}


function showSeasonEndModal() {
    const outcome = getSeasonOutcome();
    const pos = state.table.findIndex(r => r.clubId === state.team.club_id);
    const c = document.getElementById("modalContent");
    c.innerHTML = `<div style="text-align:center;">
        <h2 style="margin:.5rem 0;">Koniec sezonu!</h2>
        <div style="font-size:1.2rem;font-weight:900;color:${outcome.color};margin-bottom:1rem;">${outcome.label}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin:1.5rem 0;text-align:left;">
            <div style="background:rgba(0,0,0,.2);border-radius:8px;padding:.8rem;">
                <div style="font-size:.7rem;color:var(--muted);text-transform:uppercase;">Pozycja</div>
                <div style="font-size:1.1rem;font-weight:800;">${pos + 1}. miejsce</div>
            </div>
            <div style="background:rgba(0,0,0,.2);border-radius:8px;padding:.8rem;">
                <div style="font-size:.7rem;color:var(--muted);text-transform:uppercase;">Budżet</div>
                <div style="font-size:1.1rem;font-weight:800;color:#fbbf24;">€${formatMoney(state.budgetMillions)}M</div>
            </div>
        </div>
        <div style="font-size:.85rem;color:var(--muted);margin-bottom:1.5rem;">
            ${outcome.budget >= 0 ? `Bonus: +€${formatMoney(outcome.budget)}M` : `Kara: -€${formatMoney(Math.abs(outcome.budget))}M`}
            ${outcome.europe ? `· Kwalifikacja: ${outcome.europe.name}` : ''}
        </div>
        <button class="btn btn-primary btn-lg full-width-btn" onclick="closeModal();applySeasonOutcome();">
            Rozpocznij nowy sezon
        </button>
    </div>`;
    document.getElementById("modal").classList.add("active");
}

async function applySeasonOutcome() {
    closeModal();
    const outcome = getSeasonOutcome();
    state.budgetMillions = Math.max(0.5, round2(state.budgetMillions + outcome.budget));

    // Bulk promotion/relegation for ALL teams across all leagues (including player)
    if (state.allLeagueData) {
        await applyAllPromotionsRelegations();

        // Find which league the player's team is now in after the moves
        const pid = state.team.club_id;
        let foundCode = null;
        let foundLeague = null;
        for (const [code, league] of Object.entries(state.allLeagueData)) {
            if (league.clubs.some(c => String(c.club_id) === String(pid))) {
                foundCode = code;
                foundLeague = league;
                break;
            }
        }
        if (foundCode && foundLeague) {
            state.selectedLeagueCode = foundCode;
            state.leagueData = foundLeague;
            state.allTeams = foundLeague.clubs;
            const teamIdx = foundLeague.clubs.findIndex(c => String(c.club_id) === String(pid));
            if (teamIdx >= 0) {
                foundLeague.clubs[teamIdx] = { ...state.team, players: state.players };
                state.team = foundLeague.clubs[teamIdx];
            }
        }
    }

    let newsText = {
        champion: `MISTRZOWIE! ${state.team.name} zdobywa mistrzostwo ligi!`,
        promoted:  `AWANS! ${state.team.name} awansuje do wyższej klasy!`,
        relegated: `SPADEK. ${state.team.name} spada z ligi.`,
        mid: `Sezon zakonczony na miejscu ${state.table.findIndex(r=>r.clubId===state.team.club_id)+1}.`,
    }[outcome.type];

    restartSeason(newsText);
    state.transferWindow = "summer";
}

async function finishSeasonNow() {
    // 1. Symuluj wszystkie pozostale mecze ligi gracza
    const unplayed = state.fixtures.filter(f => !f.played);
    const dates = [...new Set(unplayed.map(f => f.date))].sort();
    for (const iso of dates) simulateFixturesForDate(iso);
    sortTable();

    // 2. Symuluj pozostale mecze innych lig
    if (state.allLeagueData && state.leagueFixtures) {
        const allDates = new Set();
        for (const fixtures of Object.values(state.leagueFixtures)) {
            fixtures.filter(f => !f.played).forEach(f => allDates.add(f.date));
        }
        for (const iso of [...allDates].sort()) simulateAllLeagueFixturesForDate(iso);
    }

    // 3. Oblicz wynik sezonu PRZED przestawieniem lig
    const outcome = getSeasonOutcome();
    const pos = state.table.findIndex(r => r.clubId === state.team.club_id) + 1;
    const row = state.table.find(r => r.clubId === state.team.club_id);
    const endYear = state.currentDate.getFullYear();

    // 4. Budżet/premia
    state.budgetMillions = Math.max(0.5, round2(state.budgetMillions + outcome.budget));

    // 5. Wiadomosc koniec sezonu — jedyna widoczna dla gracza
    addNews(
        `Koniec sezonu ${endYear - 1}/${endYear}. ` +
        `${state.team.name}: miejsce ${pos}/${state.table.length}, ` +
        `${row?.points || 0} pkt. ` +
        `Budżet: ${outcome.budget >= 0 ? '+' : ''}€${formatMoney(outcome.budget)}M.`
    );

    // 6. Baraże i awanse/spadki
    const report = await applyAllPromotionsRelegations();
    if (report?.barazMsg) addNews(report.barazMsg);

    // 7. Wiadomosc o wyniku
    const labels = {
        champion:      `${state.team.name} — Mistrzowie ligi!`,
        promoted:      `${state.team.name} awansuje do wyższej klasy!`,
        relegated:     `${state.team.name} spada z ligi.`,
        playoff_promo: `${state.team.name} gra w barażu — wynik podany powyżej.`,
        playoff_releg: `${state.team.name} gra w barażu — wynik podany powyżej.`,
    };
    if (labels[outcome.type]) addNews(labels[outcome.type]);
    state.europeanEntry = outcome.europe ? {
        code: outcome.europe.short === "LM" ? "UCL" : outcome.europe.short === "LE" ? "UEL" : "UECL",
        short: outcome.europe.short,
        name: outcome.europe.name,
        color: outcome.europe.color,
    } : null;
    if(state.europeanEntry) addNews(`Europejskie puchary: ${state.team.name} zagra w ${state.europeanEntry.name}.`);

    // 8. Zaktualizuj lige gracza po ruchach
    if (state.allLeagueData) {
        const pid = String(state.team.club_id);
        for (const [code, league] of Object.entries(state.allLeagueData)) {
            if (!league.clubs.some(c => String(c.club_id) === pid)) continue;
            state.selectedLeagueCode = code;
            state.leagueData         = league;
            state.allTeams           = league.clubs;
            const ti = league.clubs.findIndex(c => String(c.club_id) === pid);
            if (ti >= 0) {
                league.clubs[ti] = { ...state.team, players: state.players };
                state.team       = league.clubs[ti];
            }
            break;
        }
    }

    addNews(`Letnie okno transferowe otwarte (do 31 sierpnia).`);

    // 9. Zaczynamy nowy sezon — skok do 1 lipca
    restartSeason();
}

function restartSeason(endNews) {
    const june = state.currentDate;
    const ny   = june.getMonth() <= 6 ? june.getFullYear() : june.getFullYear() + 1;

    state.currentDate  = new Date(ny, 6, 1);
    state.calendarDate = new Date(ny, 6, 1);
    state.seasonFinished = false;
    state.transferWindow = "summer";
    state.results  = [];
    state.matchLog = [];
    
    // Wyczyść stare struktury sezonowe
    state.leagueFixtures = {};
    state.europeanGroup  = null;
    state.europeanOpponents = [];
    state.uclLeague = null;

    agePlayers();
    generateYouthPlayers(2);
    
    state.players.forEach(p => {
        p.matches = 0; p.goals = 0; p.assists = 0;
        p.fitness = 96; p.morale = 82;
        p.yellowCards = 0; p.redCards = 0;
        p.suspended = false;
        if(p.injury) delete p.injury;
    });

    generateFixtures(ny);
    initTable();
    
    if (state.allLeagueData) {
        for (const [code, league] of Object.entries(state.allLeagueData)) {
            initLeagueTable(code, league);
        }
        generateAllLeagueFixtures(ny);
    } else if (state.selectedLeagueCode && state.leagueData) {
        initLeagueTable(state.selectedLeagueCode, state.leagueData);
    }
    
    if(state.leagueData) state.allTeams = state.leagueData.clubs;

    autoPick();
    
    if(endNews) addNews(endNews);
    addNews(`Sezon ${ny}/${ny+1} rozpoczety. Budzet: €${formatMoney(state.budgetMillions)}M.`);
    
    if(state.europeanEntry) {
        addNews(`Terminarz UEFA dodany: ${state.europeanEntry.name}.`);
    }
    
    renderAll();
}

function showMatchResult(){
    const fx=getUserFixtureByDate(toIsoDate(state.currentDate));
    if(!fx||!fx.played)return;
    const h=getClub(fx.homeClubId),a=getClub(fx.awayClubId);
    const myTeam=fx.homeClubId===state.team.club_id;
    const myG=myTeam?fx.homeGoals:fx.awayGoals;
    const opG=myTeam?fx.awayGoals:fx.homeGoals;
    const opp=myTeam?a.name:h.name;
    const result=myG>opG?"WYGRANA":myG===opG?"REMIS":"PRZEGRANA";
    const color=myG>opG?"#10b981":myG===opG?"#f59e0b":"#ef4444";
    const report = fx.matchReport;
    const reportHtml = report ? `<div class="match-report-grid">
        <div class="match-report-stat"><span>Posiadanie</span><strong>${report.possessionHome}% - ${report.possessionAway}%</strong></div>
        <div class="match-report-stat"><span>Strzaly</span><strong>${report.shotsHome} - ${report.shotsAway}</strong></div>
        <div class="match-report-stat"><span>xG</span><strong>${report.xgHome} - ${report.xgAway}</strong></div>
    </div><div style="text-align:left;max-height:150px;overflow:auto;background:rgba(0,0,0,.22);border-radius:8px;padding:.6rem;margin-bottom:1rem;">${report.events.map(e=>`<div style="font-size:.78rem;color:var(--muted);"><strong style="color:#fff;">${e.min}'</strong> ${escapeHtml(e.text)}</div>`).join("")}</div>` : "";
    const c=document.getElementById("modalContent");
    c.innerHTML=`<div style="text-align:center;"><div style="font-size:.75rem;text-transform:uppercase;font-weight:700;color:${color};letter-spacing:.1em;margin-bottom:.5rem;">${result} · ${escapeHtml(getFixtureCompetitionLabel(fx))}</div><div style="display:flex;align-items:center;justify-content:center;gap:1rem;margin-bottom:1rem;"><div style="text-align:center;"><div style="width:60px;height:60px;border-radius:50%;background:${h.color};margin:0 auto .3rem;background-image:url('${h.logo_url}');background-size:76%;background-repeat:no-repeat;background-position:center;"></div><div style="font-size:.8rem;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(h.name)}</div></div><div style="font-size:2.5rem;font-weight:900;color:#fff;padding:0 .5rem;">${fx.homeGoals}:${fx.awayGoals}</div><div style="text-align:center;"><div style="width:60px;height:60px;border-radius:50%;background:${a.color};margin:0 auto .3rem;background-image:url('${a.logo_url}');background-size:76%;background-repeat:no-repeat;background-position:center;"></div><div style="font-size:.8rem;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(a.name)}</div></div></div>${reportHtml}<div style="color:var(--muted);font-size:.85rem;margin-bottom:1.5rem;">${state.matchLog[0]||""}</div><div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;"><button class="btn btn-primary" onclick="closeModal()">OK</button><button class="btn btn-accent" onclick="simulateDay();closeModal();"><i class="fi fi-rr-forward"></i> Kontynuuj</button></div></div>`;
    document.getElementById("modal").classList.add("active");
}
function buildPlayerTooltipHtml(player) {
    const pc = positionColor(player.position);
    const rc = ratingClass(player.rating);
    const bc = ratingBorderColor(player.rating);
    const photo = player.photo_url
        ? `<img class="pt-photo" src="${escapeHtml(player.photo_url)}" alt="" onerror="this.style.display='none'">`
        : `<div class="pt-photo pt-photo-fallback" style="background:${pc};">${escapeHtml(POS_ICON[player.position]||"")}</div>`;
    const fitPct = player.fitness || 96;
    const fitColor = fitPct >= 85 ? '#10b981' : fitPct >= 65 ? '#f59e0b' : '#ef4444';
    const morPct = player.morale || 82;
    const morColor = morPct >= 75 ? '#10b981' : morPct >= 50 ? '#f59e0b' : '#ef4444';
    return `<div class="pt-header">${photo}<div><div class="pt-name">${escapeHtml(player.name)}</div><div class="pt-meta">${escapeHtml(POS_MAP[player.position]||"")} · ${player.age||"-"} lat · <span class="player-rating-chip ${rc}" style="font-size:.65rem;">${player.rating} OVR</span></div></div></div>
<hr class="pt-divider">
<div class="pt-stats">
<div><span>Wartość</span><span>€${formatMoney(player.valueMillions)}M</span></div>
<div><span>Pensja</span><span>€${Math.round((player.wageMillions||0)/52*1000)}K/tydz</span></div>
<div><span>Mecze</span><span>${player.matches}</span></div>
<div><span>Gole</span><span>${player.goals}</span></div>
<div><span>Asysty</span><span>${player.assists||0}</span></div>
</div>
<hr class="pt-divider">
<div class="pt-bar"><div class="pt-bar-label"><span>Kondycja</span><span style="color:${fitColor};">${fitPct}%</span></div><div class="pt-bar-track"><div class="pt-bar-fill" style="width:${fitPct}%;background:${fitColor};"></div></div></div>
<div class="pt-bar"><div class="pt-bar-label"><span>Morale</span><span style="color:${morColor};">${morPct}%</span></div><div class="pt-bar-track"><div class="pt-bar-fill" style="width:${morPct}%;background:${morColor};"></div></div></div>`;
}

let _tooltipTimeout = null;

function showPlayerTooltip(player, e) {
    clearTimeout(_tooltipTimeout);
    const el = document.getElementById("playerTooltip");
    if (!el) return;
    el.innerHTML = buildPlayerTooltipHtml(player);
    el.style.display = "block";
    positionTooltip(el, e);
}

function positionTooltip(el, e) {
    let x = e.clientX + 16;
    let y = e.clientY + 8;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - 16;
    if (y + h > window.innerHeight - 8) y = e.clientY - h - 8;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    el.style.left = x + "px";
    el.style.top = y + "px";
}

function hidePlayerTooltip() {
    clearTimeout(_tooltipTimeout);
    _tooltipTimeout = setTimeout(() => {
        const el = document.getElementById("playerTooltip");
        if (el) el.style.display = "none";
    }, 100);
}

function showPlayerModal(player){const c=document.getElementById("modalContent");const starter=state.lineup.some((p)=>p.id===player.id);const rb=player.rating_base||0;const re=player.rating_experience||0;const rp=player.rating_potential||0;const maxR=90;const barW=(v)=>`<div style="flex:1;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;"><div style="width:${Math.round(v/maxR*100)}%;height:100%;background:var(--primary-light);border-radius:3px;"></div></div>`;const potBar=player.potential>0?`<div style="margin-top:.5rem;"><p style="font-size:.78rem;color:var(--muted);font-weight:700;margin:0 0 .2rem 0;">Potencjał: <span style="color:var(--accent-cyan);">+${rp} OVR</span></p>${barW(rp)}</div>`:"";c.innerHTML=`<h2>${POS_ICON[player.position]||""} ${escapeHtml(player.name)}</h2>
<div class="grid-2" style="margin-top:1rem;">
<div>
<p><strong> Pozycja:</strong> ${escapeHtml(POS_MAP[player.position])}</p>
<p><strong> Wiek:</strong> ${player.age||"-"} lat</p>
<p><strong> Ocena:</strong> <span class="player-rating-chip ${ratingClass(player.rating)}">${player.rating} OVR</span></p>
<p><strong>€ Wartość:</strong> €${formatMoney(player.valueMillions)}M</p>
<p><strong> Pensja:</strong> €${Math.round((player.wageMillions||0)/52*1000)}K / tydz</p>
<p><strong>Zolte kartki:</strong> ${player.yellowCards || 0}</p>
<p><strong>Czerwone:</strong> ${player.redCards || 0}</p>
</div>
<div>
<p><strong> Kondycja:</strong> ${player.fitness}%</p>
<p><strong> Morale:</strong> ${player.morale}%</p>
<p><strong> Mecze:</strong> ${player.matches}</p>
<p><strong> Gole:</strong> ${player.goals}</p>
${player.suspended ? '<p style="color:#f59e0b;font-weight:700;">ZAWIESZONY — pauza w nastepnym meczu</p>' : ""}
${player.injury ? `<p style="color:#ef4444;font-weight:700;">KONTUZJA: ${escapeHtml(player.injury.type)} — ${player.injury.daysLeft} dni</p>` : ""}
</div>
</div>
<div style="margin-top:1rem;padding-top:.8rem;border-top:1px solid var(--border);">
<p style="font-size:.78rem;font-weight:700;color:var(--muted);margin:0 0 .4rem 0;">Szczegóły oceny</p>
<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem;"><span style="font-size:.72rem;color:var(--muted);width:80px;">Bazowa:</span><span style="font-size:.78rem;">${rb}</span>${barW(rb)}</div>
${re>0?`<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem;"><span style="font-size:.72rem;color:var(--muted);width:80px;">Doświadczenie:</span><span style="font-size:.78rem;color:#fbbf24;">+${re}</span>${barW(re)}</div>`:""}
${potBar}
</div>
<div style="margin-top:.75rem;padding:.75rem;background:rgba(0,0,0,.2);border-radius:10px;border:1px solid var(--border);">
    <div style="font-size:.75rem;font-weight:700;color:var(--muted);margin-bottom:.4rem;text-transform:uppercase;">Kontrakt</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap;">
        <div>
            <span style="font-size:1.1rem;font-weight:900;color:${(player.contractYears||0)<=1?'#ef4444':(player.contractYears<=2?'#f59e0b':'#10b981')};">${player.contractYears || 0} lat</span>
            <span style="font-size:.78rem;color:var(--muted);margin-left:.4rem;">pozostalo</span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="renewContract(${player.id})">Przedluz kontrakt</button>
    </div>
</div>
<div class="action-stack" style="margin-top:1.5rem;">
<button class="btn btn-secondary" onclick="closeModal()"> Zamknij</button>
${starter?"":`<button class="btn btn-red" onclick="sellPlayer(${player.id});closeModal();">€ Sprzedaj</button>`}
</div>`;document.getElementById("modal").classList.add("active");}
function renewContract(playerId) {
    const p = state.players.find(pl => pl.id === playerId);
    if (!p) return;
    if (p.contractYears >= 4) {
        _transferMsg?.("Zawodnik ma jeszcze dlugi kontrakt.", "bad"); return;
    }
    const bonus = round2((p.wageMillions || 0) * 0.10 * (4 - (p.contractYears || 1)));
    if (bonus > state.budgetMillions) {
        _transferMsg?.(`Brak budzetu — premia podpisowa: €${formatMoney(bonus)}M`, "bad");
        return;
    }
    const raise = round2((p.wageMillions || 0) * 0.12);
    p.contractYears = 4;
    p.wageMillions  = round2((p.wageMillions || 0) + raise);
    p.morale        = Math.min(99, (p.morale || 75) + 8);
    state.budgetMillions = round2(state.budgetMillions - bonus);
    addNews(`Kontrakt: ${p.name} przedluzyl umowe na 4 lata (+12% pensji).`);
    closeModal();
    renderAll();
}

function sellPlayer(playerId){const idx=state.players.findIndex((p)=>p.id===playerId);if(idx<0)return;const p=state.players[idx];const fee=round2(p.valueMillions*0.78);state.budgetMillions=round2(state.budgetMillions+fee);state.wageBudgetMillions=round2(state.wageBudgetMillions+p.wageMillions);state.players.splice(idx,1);state.lineup=state.lineup.filter((pl)=>pl.id!==playerId);state.bench=state.bench.filter((pl)=>pl.id!==playerId);state.reserves=(state.reserves||[]).filter((pl)=>pl.id!==playerId);autoPick();addNews(`€ ${p.name} odchodzi za €${formatMoney(fee)}M`);renderAll();}
function addNews(text){state.news.push({date:formatDateLong(state.currentDate),text});}
function getClub(id){
    const sid = String(id);
    let club = state.allTeams?.find((c)=>String(c.club_id)===sid);
    if(club) return club;
    if(state.europeanOpponents){
        club = state.europeanOpponents.find((c)=>String(c.club_id)===sid);
        if(club) return club;
    }
    if(state.uclLeague){
        club = state.uclLeague.teams.find((c)=>String(c.club_id)===sid);
        if(club) return club;
    }
    if(state.allLeagueData){
        for(const league of Object.values(state.allLeagueData)){
            club = league.clubs?.find((c)=>String(c.club_id)===sid);
            if(club) return club;
        }
    }
    if(sid.startsWith("EURO-")||sid.startsWith("UCL-Q")) {
        const parts = sid.split("-");
        const cupCode = parts[0]==="UCL"?"UCL":parts[1];
        const num = parts[0]==="UCL"?parts[2]:parts[2];
        const cup = UEFA_CUPS[cupCode];
        return {
            club_id: sid,
            name: sid.startsWith("UCL-Q")?`Kwalifikant ${num}`:`UEFA Club ${num}`,
            color: cupCode==="UCL"?"#1d4ed8":cupCode==="UEL"?"#ea580c":"#16a34a",
            logo_url: "",
            avg_rating: cupCode==="UCL"?78:cupCode==="UEL"?73:68
        };
    }
    return null;
}
function getTableRow(cid){return state.table.find((r)=>r.clubId===String(cid));}
function getFixturesByDate(iso){return state.fixtures.filter((f)=>f.date===iso);}
function getUserFixtures(){return state.fixtures.filter((f)=>isUserFixture(f));}
function getUserFixtureByDate(iso){return state.fixtures.find((f)=>f.date===iso&&isUserFixture(f));}
function getUserResults(){return state.results.filter((r)=>r.userMatch);}
function remainingUserFixtures(){return getUserFixtures().filter((f)=>!f.played).length;}
function hasPendingFixturesOnDate(iso){return getFixturesByDate(iso).some((f)=>!f.played);}
function allFixturesPlayed(){return state.fixtures.every((f)=>f.played);}
function isPastSeasonEnd() {
    const d = state.currentDate;
    if (!state.fixtures || !state.fixtures[0] || !state.fixtures[0].date) return false;
    const seasonStartYear = parseInt(state.fixtures[0].date.split("-")[0]);
    return d >= new Date(seasonStartYear + 1, 5, 1);
}
function isUserFixture(f){return f.homeClubId===state.team.club_id||f.awayClubId===state.team.club_id;}
function getFixtureCompetitionLabel(fx){
    if(!fx?.competition||fx.competition==="league") return "Liga";
    return UEFA_CUPS[fx.competition]?.name || fx.competition;
}
function fixtureRoundLabel(fx){
    if(!fx?.competition||fx.competition==="league") return `Kolejka ${fx.round}`;
    return `${UEFA_CUPS[fx.competition]?.short || fx.competition} ${fx.stage || "Mecz"} ${fx.round}`;
}
// FORM_ICON, UEFA_CUPS, UEFA_CODE_ALIASES
function describeDay(){const d=state.currentDate.getDay();if(d===1)return"Regeneracja";if(d===2||d===4)return"Trening taktyczny";if(d===3)return"Analiza przeciwnika";if(d===5)return"Przygotowanie meczowe";return"Dzień klubowy";}
function paintBadge(elId,url,color,fallback){const n=document.getElementById(elId);n.style.background=color||"var(--bg-light)";if(url){n.style.backgroundImage=`url('${url}')`;n.style.backgroundSize="78%";n.style.backgroundPosition="center";n.style.backgroundRepeat="no-repeat";n.textContent="";}else{n.style.backgroundImage="";n.textContent=fallback||"";}}
function snapToMatchDay(d){
    const day=d.getDay();
    if(day===2)d.setDate(d.getDate()+(Math.random()<0.5?-1:3));
    else if(day===3)d.setDate(d.getDate()+(Math.random()<0.5?-2:2));
    else if(day===4)d.setDate(d.getDate()+(Math.random()<0.5?1:2));
}
function toIsoDate(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function fromIsoDate(v){const[y,m,d]=String(v).split("-").map(Number);return new Date(y,m-1,d);}
function formatDateLong(d){return`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;}
function clubCrestHtml(url,name,cls){if(url)return`<img class="${cls||"club-crest"}" src="${escapeHtml(url)}" alt="" onerror="this.style.display='none'" loading="lazy">`;return"";}
function shuffle(items){const c=[...items];for(let i=c.length-1;i>0;i-=1){const j=Math.floor(Math.random()*(i+1));[c[i],c[j]]=[c[j],c[i]];}return c;}

// skróty klawiszowe usunięte
