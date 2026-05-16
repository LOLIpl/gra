if(typeof rand==="undefined") window.rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
if(typeof clamp==="undefined") window.clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

const FORMATIONS = {
    "4-3-3":{BR:1,OB:4,PO:3,NA:3,positions:[{top:88,left:50},{top:68,left:15},{top:68,left:38},{top:68,left:62},{top:68,left:85},{top:45,left:25},{top:45,left:50},{top:45,left:75},{top:18,left:20},{top:18,left:50},{top:18,left:80}]},
    "4-4-2":{BR:1,OB:4,PO:4,NA:2,positions:[{top:88,left:50},{top:68,left:15},{top:68,left:38},{top:68,left:62},{top:68,left:85},{top:42,left:15},{top:42,left:38},{top:42,left:62},{top:42,left:85},{top:18,left:38},{top:18,left:62}]},
    "4-2-3-1":{BR:1,OB:4,PO:5,NA:1,positions:[{top:88,left:50},{top:68,left:15},{top:68,left:38},{top:68,left:62},{top:68,left:85},{top:50,left:30},{top:50,left:70},{top:35,left:20},{top:35,left:50},{top:35,left:80},{top:15,left:50}]},
    "3-5-2":{BR:1,OB:3,PO:5,NA:2,positions:[{top:88,left:50},{top:68,left:25},{top:68,left:50},{top:68,left:75},{top:50,left:15},{top:50,left:35},{top:50,left:50},{top:50,left:65},{top:50,left:85},{top:18,left:38},{top:18,left:62}]},
};
const POS_MAP = {BR:"BR",OB:"ŚO",PO:"ŚP",NA:"N"};
const MONTHS = ["Styczen","Luty","Marzec","Kwiecien","Maj","Czerwiec","Lipiec","Sierpien","Wrzesien","Pazdziernik","Listopad","Grudzien"];
const DAY_NAMES = ["Pn","Wt","Sr","Cz","Pt","Sb","Nd"];
const POS_ICON = {BR:"BR",OB:"ŚO",PO:"ŚP",NA:"N"};
const FORM_ICON = {W:'<span style="color:#10b981;font-weight:800;">W</span>',D:'<span style="color:#9ca3af;font-weight:800;">R</span>',L:'<span style="color:#ef4444;font-weight:800;">P</span>'};
const AI_STYLES = ["balanced","attacking","defensive","possession","counter"];
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
.expressive-league-table tr.pos-promo td:first-child::before { content:'▲ '; font-size:.6rem; }
.expressive-league-table tr.pos-releg td:first-child::before { content:'▼ '; font-size:.6rem; }
.table-legend-expressive{padding:.6rem 1.5rem 1.2rem;display:flex;gap:1.2rem;font-size:.78rem;color:var(--muted);border-top:1px solid rgba(255,255,255,.03);}
.leg-box{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:.4rem;vertical-align:middle;}
.leg-box.promo{background:#10b981;}
.leg-box.releg{background:#ef4444;}

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

@media(max-width:900px){
  .dashboard-content{flex-direction:column;}
  .calendar-layout-container{flex-direction:column;}
  .calendar-sidebar{flex:auto;}
  .finance-display-row{flex-direction:column;}
  .filters-row{grid-template-columns:1fr;}
  .squad-bottom-grid{flex-direction:column;}
  .pitch-visual{min-height:380px;}
}
/* ---- TĹO KARIERY ---- */
#career-bg{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;}
.cb-grid{position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(37,99,235,.07) 1px,transparent 1px),
    linear-gradient(90deg,rgba(37,99,235,.07) 1px,transparent 1px);
  background-size:60px 60px;
  mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,#000 40%,transparent 100%);}
.cb-orb{position:absolute;border-radius:50%;filter:blur(80px);animation:orbFloat 14s ease-in-out infinite;}
.cb-orb1{width:520px;height:520px;background:rgba(37,99,235,.13);top:-120px;left:-100px;animation-delay:0s;}
.cb-orb2{width:400px;height:400px;background:rgba(6,182,212,.10);bottom:-80px;right:-60px;animation-delay:-5s;}
.cb-orb3{width:300px;height:300px;background:rgba(16,185,129,.08);top:40%;left:55%;animation-delay:-9s;}
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

function getUefaForLeague(code) {
    if (!state.uefaData) return null;
    const entry = state.uefaData.rankings?.find(r => r.competition_code === code);
    return entry || null;
}

async function loadUefaData() {
    try {
        const data = await apiGet("/api/uefa");
        state.uefaData = data;
    } catch (e) {
        state.uefaData = null;
    }
}

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
    const tier = getLeagueTier();
    const leagueBoost = tier.tier === 1 ? 2.0 : tier.tier === 2 ? 1.4 : tier.tier === 3 ? 1.0 : 0.7;
    state.budgetMillions = round2(Math.max(team.budget_millions, team.budget_millions * leagueBoost));
    state.wageBudgetMillions = round2(Math.max(1.5, state.budgetMillions * 0.55));
    addNews(`Liga: ${tier.label} (Tier ${tier.tier}) — Budżet startowy: €${formatMoney(state.budgetMillions)}M`);
    if(state.simTimer){clearTimeout(state.simTimer);state.simTimer=null;}
    state.simulating=false;state.simMode="none";
    state.lineup=[];state.bench=[];state.reserves=[];
    state.transferPlayers=[];state._transfersLoaded=false;state.allLeagueData=null;

    setLoadProgress(40,"Generowanie terminarza...","fixtures");
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
    return {...player,id,valueMillions:round2(Math.max(0.1,mv/1e6)),wageMillions:round2(Math.max(0.04,(mv>0?mv:3e5)/1e6*0.07)),fitness:96,morale:82,goals:0,assists:0,matches:0};
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
            fixtures.push({id:`${f.round}-${f.homeClubId}-${f.awayClubId}`,round:f.round,date:toIsoDate(cur),homeClubId:f.homeClubId,awayClubId:f.awayClubId,played:false,homeGoals:null,awayGoals:null});
        });
        cur.setDate(cur.getDate() + gapDays);
    });
    state.fixtures=fixtures;
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
    const cS=document.getElementById("transferClubFilter"),lS=document.getElementById("transferLeagueFilter");
    if(!cS||!lS)return;
    const clubs=[...new Set(state.transferPlayers.map((p)=>p.club_name))].sort((a,b)=>a.localeCompare(b,"pl"));
    const leagues=[...new Set(state.transferPlayers.map((p)=>p.league_name))].sort((a,b)=>a.localeCompare(b,"pl"));
    cS.innerHTML=`<option value=""><i class="fi fi-br-building"></i> Wszystkie kluby</option>${clubs.map((c)=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}`;
    lS.innerHTML=`<option value=""><i class="fi fi-ss-trophy-achievement-skill"></i> Wszystkie ligi</option>${leagues.map((l)=>`<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join("")}`;
}

let _statsSort = "goals";

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

function renderAll(){updateDashboard();renderFormation();renderBenchList();renderReservesList();renderStats();renderTransfers();renderCurrentMatchPanels();renderCalendar();renderSchedule();renderTable();updateSaveStatus();}
function updateSaveStatus(){const s=document.getElementById("saveStatusSettings");if(s)s.textContent=state.saveStatus;}

function showUefa() {
    renderUefaRanking();
    showSection('uefa');
}

function renderUefaRanking() {
    const tbody = document.getElementById("uefaRankingBody");
    if (!tbody) return;
    if (!state.uefaData || !state.uefaData.rankings) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:2rem;">Brak danych rankingu UEFA</td></tr>';
        return;
    }
    const rows = state.uefaData.rankings.map(r => {
        const highlight = r.competition_code === state.selectedLeagueCode ? 'style="background:rgba(37,99,235,.12);font-weight:700;"' : '';
        return `<tr ${highlight}>
            <td>${r.rank}</td>
            <td>${escapeHtml(r.country)}</td>
            <td>${escapeHtml(r.league_name)}</td>
            <td style="font-weight:800;color:var(--primary-light);">${r.coefficient.toFixed(3)}</td>
            <td>${r.ucl_spots}</td>
            <td>${r.uel_spots}</td>
            <td>${r.uecl_spots}</td>
            <td style="font-weight:800;">${r.total_spots}</td>
        </tr>`;
    }).join('');
    tbody.innerHTML = rows;
}

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach((n)=>n.classList.remove("active"));
    document.querySelectorAll("nav button").forEach((n)=>n.classList.remove("active"));
    document.getElementById(sectionId)?.classList.add("active");
    const btn=document.getElementById(`btn-${sectionId}`);
    if(btn)btn.classList.add("active");
    if(sectionId==="gra"||sectionId==="simulation"){renderCurrentMatchPanels();renderCalendar?.();renderSchedule?.();}
    if(sectionId==="table"){fillLeagueTableSelector();renderTable();}
    if(sectionId==="transfers")renderTransfers();
    if(sectionId==="settings")updateSaveStatus();
}

function updateNav(){paintBadge("navBadge",state.team.logo_url,state.team.color,initials(state.team.name));document.getElementById("navTeamName").textContent=state.coachName?`${state.coachName} · ${state.team.name}`:state.team.name;document.getElementById("navLeagueName").textContent=state.leagueData.name;}

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
    const moveCount=Math.max(1,Math.min(Math.floor(tbl.length*0.15),Math.floor((tbl.length-2)/2)));
    const promoCount = moveCount; const relegCount = moveCount;
    tbody.innerHTML=tbl.map((r,i)=>{const cls=r.clubId===state.team.club_id?"highlight":"";const posCls=i<moveCount?"pos-promo":i>=tbl.length-moveCount?"pos-releg":"pos-normal";const zoneLabel=i<promoCount?' title="Strefa awansu"':i>=tbl.length-relegCount?' title="Strefa spadku"':'';const f=r.form.slice(-5).map((v)=>FORM_ICON[v]||v).join(" ");return`<tr class="${cls}"${zoneLabel}><td><span class="pos ${posCls}">${i+1}</span></td><td>${clubCrestHtml(r.logo_url,r.name)}${escapeHtml(r.name)}</td><td>${r.played}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td><td style="font-weight:800;color:var(--primary-light);">${r.points}</td><td>${f}</td></tr>`;}).join("");
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
    const rq=FORMATIONS[state.formation];const sorted=[...state.players].sort((a,b)=>b.rating-a.rating);const lineup=[];
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
function renderBenchList(){const l=document.getElementById("benchList");l.innerHTML="";l.dataset.zone="bench";setupDropZone(l,"bench");state.bench.forEach((p,i)=>l.appendChild(buildPlayerRow(p,i+1,"bench")));}
function renderReservesList(){const l=document.getElementById("reservesList");if(!l)return;l.innerHTML="";l.dataset.zone="reserves";setupDropZone(l,"reserves");if(!state.reserves)state.reserves=[];state.reserves.forEach((p,i)=>l.appendChild(buildPlayerRow(p,"-","reserves")));}

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
    r.innerHTML=`<div class="num" style="background:${pc};color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.7rem;flex-shrink:0;">${escapeHtml(badge)}</div><div class="info"><div class="p-name">${sh}${escapeHtml(player.name)}</div><div class="p-details">${escapeHtml(POS_MAP[player.position])} | ${player.age||"-"} lat | €${formatMoney(player.valueMillions)}M</div></div><div class="player-rating-chip ${rc}">${player.rating}<span class="fit-dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${fitColor};margin-left:4px;vertical-align:middle;" title="Kondycja: ${fitPct}%"></span></div>`;
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

function updateTransferFilters(){state.transferQuery=(document.getElementById("transferNameFilter")?.value||"").trim().toLowerCase();state.transferAgeMax=document.getElementById("transferAgeFilter")?.value||"";state.transferClub=document.getElementById("transferClubFilter")?.value||"";state.transferLeague=document.getElementById("transferLeagueFilter")?.value||"";renderTransfers();}
function filterTransfers(filter){state.transferFilter=filter;renderTransfers();}

function renderTransfers() {
    const budgetEl = document.getElementById("transferBudget");
    if (budgetEl) budgetEl.textContent = `€${formatMoney(state.budgetMillions)}M`;
    const wbEl = document.getElementById("wageBudgetDisplay");
    if (wbEl) wbEl.textContent = `${wageToKPerWeek(state.wageBudgetMillions)}K/tydz`;
    const scEl = document.getElementById("squadCountDisplay");
    if (scEl) scEl.textContent = `${state.players.length} / 30`;

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
            list.innerHTML = `<div class="transfer-empty"><span style="font-size:2rem;">📭</span><p>Brak zawodników dostęnych na rynku.</p></div>`;
        } else {
            list.innerHTML = `<div class="transfer-empty"><div class="loader-spinner" style="margin:0 auto 1rem;"></div><p>Ładowanie zawodników...</p></div>`;
        }
        return;
    }

    let filtered = state.transferPlayers.filter(p => {
        const name = String(p.name || "").toLowerCase();
        const cn   = String(p.club_name  || p.club   || "");
        const ln   = String(p.league_name || p.league || "");
        const age  = Number(p.age || 0);
        const posOk = state.transferFilter === "all" || p.position === state.transferFilter;
        return posOk
            && (!state.transferQuery   || name.includes(state.transferQuery))
            && (!state.transferAgeMax  || age <= Number(state.transferAgeMax))
            && (!state.transferClub    || cn === state.transferClub)
            && (!state.transferLeague  || ln === state.transferLeague);
    });

    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const shown = filtered.slice(0, 80);

    if (!shown.length) {
        list.innerHTML = `<div class="transfer-empty"><span style="font-size:2rem;">🔍</span><p>Brak zawodników dla wybranych filtrów.</p></div>`;
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

        return `
<div class="tc-card" style="border-color:${bc}55;">
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
    ? `<div class="tc-owned">✓ Już w drużynie</div>`
    : `
  <button class="btn ${p.negoOpen ? 'btn-secondary' : 'btn-primary'} btn-sm"
    style="width:100%;justify-content:center;"
    onclick="toggleNegotiation('${escapeHtml(rawPid)}')">
    ${p.negoOpen ? '▲ Zamknij negocjacje' : '✎ Negocjuj transfer'}
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
      📨 Złóż ofertę
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
            msg: `❌ Klub odrzuca. Oferta za niska o €${formatMoney(need)}M. Kontrpropozycja: €${formatMoney(counter)}M`,
            counterFee: counter, counterWageK: null,
        };
    }

    if (wageOfferedM < minWage) {
        const needK = wageToKPerWeek(minWage - wageOfferedM);
        const counterWageM = round2(expWageM * (0.88 + Math.random() * 0.10));
        const counterK = wageToKPerWeek(counterWageM);
        return {
            accepted: false, type: 'wage_hard',
            msg: `❌ Zawodnik odrzuca pensję — za mała o ${needK}K/tydz. Żąda: ${counterK}K/tydz`,
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
            msg: `🤝 Klub nie zgadza się na tę kwotę. Ich kontrpropozycja: €${formatMoney(counter)}M`,
            counterFee: counter, counterWageK: null,
        };
    }

    if (Math.random() > wageChance) {
        const counterWageM = round2(expWageM * (0.90 + Math.random() * 0.08));
        const counterK = wageToKPerWeek(counterWageM);
        return {
            accepted: false, type: 'wage_soft',
            msg: `🤝 Zawodnik chce więcej. Jego propozycja: ${counterK}K/tydz`,
            counterFee: null, counterWageK: counterK,
        };
    }

    return { accepted: true, msg: `✅ Oferta zaakceptowana!` };
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
        p.lastResult = { ok: false, msg: '⚠️ Wpisz kwotę transferu i pensję.' };
        renderTransfers(); return;
    }
    if (feeM > state.budgetMillions) {
        p.lastResult = { ok: false, msg: `⚠️ Brakuje Ci €${formatMoney(feeM - state.budgetMillions)}M budżetu.` };
        renderTransfers(); return;
    }
    const wageM = wageFromKPerWeek(wageK);
    if (wageM > state.wageBudgetMillions) {
        p.lastResult = { ok: false, msg: `⚠️ Przekroczony budżet płacowy.` };
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

    addNews(`✅ Transfer: ${p.name} dołącza za €${formatMoney(feeM)}M · ${wageK}K/tydz`);
    autoPick();
    _transferMsg(`✅ ${p.name} podpisał kontrakt za €${formatMoney(feeM)}M!`, 'ok');
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

function updateSimSpeed(){simSpeedMs=Number(document.getElementById("simSpeedSelect")?.value||500);}

function renderCurrentMatchPanels() {
    const iso=toIsoDate(state.currentDate);const fx=getUserFixtureByDate(iso);
    const log=document.getElementById("matchLog");if(log)log.innerHTML=state.matchLog.slice(-8).reverse().map((l)=>`<div>${escapeHtml(l)}</div>`).join("");
    const info=state.seasonFinished?seasonFinishedInfo():fx?matchInfoFromFixture(fx):trainingDayInfo();
    updateMatchPanel("matchDayBadge","matchDate","homeLogo","homeName","awayLogo","awayName","scoreDisplay","simBtn",info,true);
    updateMatchPanel("dashboardMatchBadge","dashboardMatchDate","dashboardHomeLogo","dashboardHomeName","dashboardAwayLogo","dashboardAwayName","dashboardScore","dashboardPlayBtn",info,false);
}

function matchInfoFromFixture(fx){
  const h = getClub(fx.homeClubId), a = getClub(fx.awayClubId);
  return {
    badge: `Kolejka ${fx.round}`,
    date: formatDateLong(state.currentDate),
    home: h,
    away: a,
    score: fx.played ? `${fx.homeGoals}:${fx.awayGoals}` : "-:-",
    playable: !fx.played,
    button: fx.played ? "Mecz rozegrany" : "▶ Rozegraj mecz"
  };
}
function trainingDayInfo(){return{badge:"Dzien treningowy",date:formatDateLong(state.currentDate),home:state.team,away:{name:describeDay(),logo_url:"",color:"var(--bg-light)"},score:"TRENING",playable:false,button:"Brak meczu"};}
function seasonFinishedInfo(){return{badge:"⚑ Koniec sezonu",date:formatDateLong(state.currentDate),home:state.team,away:{name:"Podsumowanie",logo_url:"",color:"#1f2937"},score:"KONIEC",playable:true,button:"📋 Podsumowanie sezonu"};}

function updateMatchPanel(badgeId,dateId,hLogoId,hNameId,aLogoId,aNameId,scoreId,btnId,info,_unused) {
    document.getElementById(badgeId).textContent=info.badge;
    document.getElementById(dateId).textContent=info.date;
    paintBadge(hLogoId,info.home.logo_url,info.home.color,initials(info.home.name));
    paintBadge(aLogoId,info.away.logo_url,info.away.color,initials(info.away.name));
    document.getElementById(hNameId).textContent=info.home.name;
    document.getElementById(aNameId).textContent=info.away.name;
    document.getElementById(scoreId).textContent=info.score;
    const b=document.getElementById(btnId);b.textContent=info.button;b.disabled=!info.playable;
    b.onclick = state.seasonFinished ? ()=>applySeasonOutcome() : startSimulation;
}

async function startSimulation(){
    if(state.seasonFinished){ await applySeasonOutcome(); return; }
    const fx=getUserFixtureByDate(toIsoDate(state.currentDate));
    if(!fx||fx.played)return;
    try{simulateFixturesForDate(toIsoDate(state.currentDate));}catch(e){console.error("Sim error:",e);}
    renderAll();
    showMatchResult();
}
async function simulateDay(){
    if(state.seasonFinished){ await applySeasonOutcome(); return; }
    const iso=toIsoDate(state.currentDate);
    const hadFixture=hasPendingFixturesOnDate(iso);
    if(hadFixture) simulateFixturesForDate(iso);
    state.players.forEach(p => {
        if (p.fitness < 96) p.fitness = Math.min(96, p.fitness + (p.position === "BR" ? 3 : 2));
    });
    state.currentDate.setDate(state.currentDate.getDate()+1);
    state.calendarDate=new Date(state.currentDate.getFullYear(),state.currentDate.getMonth(),1);
    const m=state.currentDate.getMonth(), d=state.currentDate.getDate();
    if(m===0&&d===1) state.transferWindow="winter";
    else if(m===1&&d===1) state.transferWindow=null;
    if(allFixturesPlayed()||isPastSeasonEnd()){ state.seasonFinished=true; state.transferWindow="summer"; await applySeasonOutcome(); renderAll(); return; }
    renderAll();
    if(hadFixture) showMatchResult();
}

function stopSimulation(){if(state.simTimer){clearTimeout(state.simTimer);state.simTimer=null;}state.simulating=false;state.simMode="none";state.calendarTargetDate=toIsoDate(state.currentDate);const sb=document.getElementById("stopBtn");if(sb)sb.style.display="none";renderAll();}
function simulateToWindow(){const next=state.fixtures.find((f)=>!f.played&&(f.homeClubId===state.team.club_id||f.awayClubId===state.team.club_id)&&f.date>=toIsoDate(state.currentDate));if(!next)return;if(state.simulating){stopSimulation();return;}startTimedSimulation(next.date,"next-match");}
function startTimedSimulation(targetIso,mode){if(!targetIso||state.seasonFinished)return;if(state.simTimer)clearTimeout(state.simTimer);state.simulating=true;state.simMode=mode;state.calendarTargetDate=targetIso;const sb=document.getElementById("stopBtn");if(sb)sb.style.display="inline-flex";renderAll();state.simTimer=setTimeout(runSimulationLoop,simSpeedMs);}
async function runSimulationLoop(){if(!state.simulating||state.seasonFinished){stopSimulation();return;}if(!state.calendarTargetDate||toIsoDate(state.currentDate)>=state.calendarTargetDate){stopSimulation();return;}await simulateDay();if(state.seasonFinished||toIsoDate(state.currentDate)>=state.calendarTargetDate){stopSimulation();return;}state.simTimer=setTimeout(runSimulationLoop,simSpeedMs);}
function skipToDate(isoDate){if(!isoDate)return;state.calendarTargetDate=isoDate;state.calendarDate=new Date(`${isoDate}T12:00:00`);if(state.simulating){startTimedSimulation(isoDate,"calendar");return;}if(isoDate<=toIsoDate(state.currentDate)){renderCalendar();return;}startTimedSimulation(isoDate,"calendar");}

function simulateFixturesForDate(isoDate){
  const fxs = getFixturesByDate(isoDate).filter(f => !f.played);
  if(!fxs.length) return;

  fxs.forEach(fx => {
    const h = getClub(fx.homeClubId), a = getClub(fx.awayClubId);
    if(!h || !a) return;

    const r = generateScore(h, a, fx);
    fx.homeGoals = r.homeGoals;
    fx.awayGoals = r.awayGoals;
    fx.played = true;
    applyResultToTable(fx);
    state.results.push({date: isoDate, round: fx.round, home: h.name, away: a.name, homeGoals: fx.homeGoals, awayGoals: fx.awayGoals, userMatch: isUserFixture(fx)});

    if(isUserFixture(fx)){
      const myG = fx.homeClubId === state.team.club_id ? fx.homeGoals : fx.awayGoals;
      const opG = fx.homeClubId === state.team.club_id ? fx.awayGoals : fx.homeGoals;
      const opp = fx.homeClubId === state.team.club_id ? a.name : h.name;
      const rw = myG > opG ? "wygrywa" : myG === opG ? "remisuje" : "przegrywa";
      state.matchLog.unshift(`${formatDateLong(state.currentDate)}: ${state.team.name} ${rw} z ${opp} ${myG}:${opG}.`);
      addNews(`${state.team.name} ${rw} z ${opp} ${myG}:${opG}`);
      applySquadEffects(myG, opG);
    }
  });

  simulateAllLeagueFixturesForDate(isoDate);
  sortTable();
  if(allFixturesPlayed()||isPastSeasonEnd()){ state.seasonFinished = true; state.transferWindow="summer"; }
}

function simulateAllLeagueFixturesForDate(isoDate) {
    if(!state.allLeagueData||!state.leagueFixtures)return;
    for(const[code,fixtures]of Object.entries(state.leagueFixtures)){if(code===state.selectedLeagueCode)continue;const league=state.allLeagueData[code];if(!league)continue;const dayF=fixtures.filter((f)=>f.date===isoDate&&!f.played);dayF.forEach((f)=>{const h=league.clubs.find((c)=>c.club_id===f.homeClubId),a=league.clubs.find((c)=>c.club_id===f.awayClubId);if(!h||!a)return;const r={homeGoals:calculateGoals(h.avg_rating+rand(-5,5),a.avg_rating+rand(-5,5)),awayGoals:calculateGoals(a.avg_rating+rand(-5,5),h.avg_rating+rand(-5,5))};f.homeGoals=r.homeGoals;f.awayGoals=r.awayGoals;f.played=true;const tbl=state.leagueTables[code];if(tbl)applyResultToTableRaw(tbl,f);});}
    for(const code of Object.keys(state.leagueTables))sortTableRaw(state.leagueTables[code]);
}

function applyResultToTableRaw(tbl,fx){const h=tbl.find((r)=>r.clubId===fx.homeClubId),a=tbl.find((r)=>r.clubId===fx.awayClubId);if(!h||!a)return;h.played+=1;a.played+=1;h.gf+=fx.homeGoals;h.ga+=fx.awayGoals;a.gf+=fx.awayGoals;a.ga+=fx.homeGoals;if(fx.homeGoals>fx.awayGoals){h.won+=1;h.points+=3;a.lost+=1;pushForm(h,"W");pushForm(a,"L");}else if(fx.homeGoals<fx.awayGoals){a.won+=1;a.points+=3;h.lost+=1;pushForm(a,"W");pushForm(h,"L");}else{h.drawn+=1;a.drawn+=1;h.points+=1;a.points+=1;pushForm(h,"D");pushForm(a,"D");}}
function sortTableRaw(tbl){tbl.sort((a,b)=>(b.points-a.points)||((b.gf-b.ga)-(a.gf-a.ga))||(b.gf-a.gf)||a.name.localeCompare(b.name,"pl"));}

function generateScore(h,a,fx){const hs=AI_STYLES[Math.floor(Math.random()*AI_STYLES.length)],as=AI_STYLES[Math.floor(Math.random()*AI_STYLES.length)];let hp=h.avg_rating+rand(-5,5),ap=a.avg_rating+rand(-5,5);if(fx.homeClubId===state.team.club_id)hp+=userTeamBonus();else hp+=aiTacticBonus(hs,h.avg_rating);if(fx.awayClubId===state.team.club_id)ap+=userTeamBonus();else ap+=aiTacticBonus(as,a.avg_rating);hp+=rand(-3,3);ap+=rand(-3,3);return{homeGoals:calculateGoals(hp,ap),awayGoals:calculateGoals(ap,hp)};}
function aiTacticBonus(s,r){switch(s){case"attacking":return 1.2+rand(0,2);case"defensive":return 0.5+rand(-1,1);case"possession":return 0.8+rand(-.5,1.5);case"counter":return 1+rand(-1,3);default:return 0.5+rand(-1,2);}}
function calculateGoals(tp, op){
    const base = 0.50 + (tp - op) * 0.010;
    let g = 0;
    for(let i = 0; i < 6; i++){
        if(Math.random() < Math.max(0.03, Math.min(0.50, base - i * 0.10))) g += 1;
    }
    return Math.max(0, Math.min(5, g));
}
function userTeamBonus(){const avg=state.lineup.reduce((s,p)=>s+p.rating,0)/Math.max(1,state.lineup.length);const avgFit=state.lineup.reduce((s,p)=>s+(p.fitness||96),0)/Math.max(1,state.lineup.length);const fitFactor=avgFit<60?0.7:avgFit<70?0.82:avgFit<80?0.9:avgFit<90?0.96:1;let t=0;if(state.tactics.style==="attacking")t+=1.4;if(state.tactics.style==="counter")t+=0.9;if(state.tactics.style==="defensive")t+=0.5;if(state.tactics.pressing==="high")t+=0.7;if(state.tactics.width==="wide")t+=0.3;return avg*0.11*fitFactor+t+rand(-2,2);}

function applyResultToTable(fx){const h=getTableRow(fx.homeClubId),a=getTableRow(fx.awayClubId);if(!h||!a)return;h.played+=1;a.played+=1;h.gf+=fx.homeGoals;h.ga+=fx.awayGoals;a.gf+=fx.awayGoals;a.ga+=fx.homeGoals;if(fx.homeGoals>fx.awayGoals){h.won+=1;h.points+=3;a.lost+=1;pushForm(h,"W");pushForm(a,"L");}else if(fx.homeGoals<fx.awayGoals){a.won+=1;a.points+=3;h.lost+=1;pushForm(a,"W");pushForm(h,"L");}else{h.drawn+=1;a.drawn+=1;h.points+=1;a.points+=1;pushForm(h,"D");pushForm(a,"D");}const ltc=state.activeLeagueTable||state.selectedLeagueCode;const lt=state.leagueTables?.[ltc];if(lt)applyResultToTableRaw(lt,fx);}
function applySquadEffects(myG,opG){
    const outfield=shuffle(state.lineup.filter(p=>p.position!=="BR"));
    outfield.slice(0,myG).forEach(p=>p.goals+=1);
    const assistPool=shuffle(outfield.filter(p=>!outfield.slice(0,myG).includes(p)));
    assistPool.slice(0,Math.min(myG,assistPool.length)).forEach(p=>p.assists=(p.assists||0)+1);
    state.lineup.forEach(p=>{
        p.matches+=1;
        p.fitness=Math.max(55,p.fitness-rand(6,14));
        p.morale=clamp(p.morale+(myG>opG?3:myG<opG?-2:0),55,99);
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
        const tag=played?'<i class="fi fi-rr-check"></i> Rozegrany':fx?`<i class="fi fi-rr-calendar-arrow-up"></i> Kolejka ${fx.round}`:(iso>todayIso?"Wolne":"Minelo");
        const oppLine=fx?`<div class="calendar-opponent">${fx.homeClubId===state.team.club_id?"vs ":"@ "}${crest}${escapeHtml(shortClubNamePatched(opp))}</div>`:`<div class="calendar-empty-note">${iso===todayIso?'<i class="fi fi-br-info"></i> Dzisiaj':"Brak meczu"}</div>`;
        const sub=fx?`<div class="calendar-subtext">${venue} • ${played?`${fx.homeGoals}:${fx.awayGoals}`:'<i class="fi fi-br-arrow-right"></i> Kliknij'}</div>`:`<div class="calendar-subtext">${isSel&&iso>todayIso?'<i class="fi fi-sr-star"></i> Cel':'<i class="fi fi-sr-spinner"></i> Trening'}</div>`;
        html.push(`<div class="${cls}" onclick="skipToDate('${iso}')"><div class="calendar-dayline"><div class="calendar-date">${dn}</div><div class="calendar-tag">${tag}</div></div>${oppLine}${sub}</div>`);
    }
    grid.innerHTML=html.join("");
    const upc=state.fixtures.filter((f)=>(f.homeClubId===state.team.club_id||f.awayClubId===state.team.club_id)&&f.date>=todayIso).slice(0,6);
    agenda.innerHTML=upc.map((f)=>{const opp=getOpponentNamePatched(f);const oc=getClub(f.homeClubId===state.team.club_id?f.awayClubId:f.homeClubId);const side=f.homeClubId===state.team.club_id?"vs":"@";const sum=f.played?`${f.homeGoals}:${f.awayGoals}`:`<i class="fi fi-rr-calendar-arrow-up"></i> Kolejka ${f.round}`;const cr=oc?.logo_url?`<img class="calendar-crest" src="${escapeHtml(oc.logo_url)}" alt="" onerror="this.style.display='none'" loading="lazy">`:"";return`<div class="calendar-agenda-item"><div><strong>${escapeHtml(formatDateLong(fromIsoDate(f.date)))}</strong><div>${side} ${cr}${escapeHtml(opp)}</div></div><div class="calendar-subtext">${sum}</div></div>`;}).join("")||`<div class="calendar-subtext">Brak nadchodzacych meczow.</div>`;
}

function findFixtureForTeamDate(iso){return state.fixtures.find((f)=>f.date===iso&&(f.homeClubId===state.team?.club_id||f.awayClubId===state.team?.club_id))||null;}
function getOpponentNamePatched(fx){if(!fx||!state.team)return"";const id=fx.homeClubId===state.team.club_id?fx.awayClubId:fx.homeClubId;return clubNameByIdPatched(id);}
function clubNameByIdPatched(id){return state.allTeams.find((c)=>c.club_id===String(id))?.name||"Nieznany klub";}
function shortClubNamePatched(n){if(!n)return"";const c=String(n).trim();return c.length<=14?c:c.split(" ").slice(0,2).join(" ");}

function changeCalendarMonth(step){state.calendarDate=new Date(state.calendarDate.getFullYear(),state.calendarDate.getMonth()+step,1);renderCalendar();}
function previousMonth(){changeCalendarMonth(-1);}
function nextMonth(){changeCalendarMonth(1);}
function renderSchedule(){const tbody=document.querySelector("#scheduleTable tbody");tbody.innerHTML="";getUserFixtures().forEach((f)=>{const h=getClub(f.homeClubId),a=getClub(f.awayClubId);tbody.innerHTML+=`<tr><td>${f.round}</td><td>${formatDateLong(fromIsoDate(f.date))}</td><td>${clubCrestHtml(h?.logo_url,h?.name)}${escapeHtml(h?.name||"?")}</td><td style="font-weight:800;">${f.played?`${f.homeGoals}:${f.awayGoals}`:"-:-"}</td><td>${clubCrestHtml(a?.logo_url,a?.name)}${escapeHtml(a?.name||"?")}</td><td>${f.played?'<span class="badge badge-green"><i class="fi fi-rr-check"></i> Rozegrany</span>':f.date===toIsoDate(state.currentDate)?'<span class="badge badge-orange"><i class="fi fi-rr-calendar-arrow-up"></i> Dzisiaj</span>':'<span class="badge badge-blue"><i class="fi fi-rr-calendar-arrow-up"></i> Plan</span>'}</td></tr>`;});}

function renderTable(){const code=state.activeLeagueTable||state.selectedLeagueCode;const tbl=state.leagueTables[code]||state.table;const tbody=document.querySelector("#leagueTable tbody");if(!tbody)return;tbody.innerHTML="";const moveCount=Math.max(1,Math.min(Math.floor(tbl.length*0.15),Math.floor((tbl.length-2)/2)));tbl.forEach((r,i)=>{const cls=i<moveCount?"pos-promo":i>=tbl.length-moveCount?"pos-releg":"pos-normal";const form=r.form.map((v)=>FORM_ICON[v]||v).join(" ");const crest=clubCrestHtml(r.logo_url,r.name);tbody.innerHTML+=`<tr class="${r.clubId===state.team.club_id?"highlight":""}"><td><span class="pos ${cls}">${i+1}</span></td><td>${crest}${escapeHtml(r.name)}</td><td>${r.played}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gf-r.ga}</td><td style="font-weight:800;color:var(--primary-light);">${r.points}</td><td>${form}</td></tr>`;});const e=document.getElementById("tableMatchDay");if(e)e.textContent=`Po ${(state.leagueTables[code]&&state.leagueTables[code][0]?.played)||0} kolejkach`;renderOtherLeaguePreviews();}

function renderOtherLeaguePreviews(){const cont=document.getElementById("otherLeaguesPreview");if(!cont||!state.allLeagueData){if(cont)cont.innerHTML="";return;}const toShow=Object.entries(state.allLeagueData).filter(([c])=>c!==state.selectedLeagueCode).slice(0,4);cont.innerHTML=toShow.map(([code,league])=>{const tbl=state.leagueTables[code]||[];const top3=tbl.slice(0,3);return`<div class="card" style="margin:0;padding:1rem;"><div class="card-header" style="margin-bottom:0.5rem;padding-bottom:0.5rem;"><h3>${escapeHtml(league.name)}</h3></div>${top3.map((r,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:0.2rem 0;font-size:0.85rem;"><span>${i+1}. ${clubCrestHtml(r.logo_url,r.name,"club-crest-sm")}${escapeHtml(r.name)}</span><span style="font-weight:700;">${r.points} pkt</span></div>`).join("")||"<div style='font-size:0.85rem;color:var(--text-muted);'>Brak danych</div>"}</div>`;}).join("");}

async function fillLeagueTableSelector(){const sel=document.getElementById("leagueTableSelector");if(!sel)return;if(state.allLeagueData){sel.innerHTML=Object.entries(state.allLeagueData).map(([code,league])=>`<option value="${escapeHtml(code)}" ${code===state.selectedLeagueCode?"selected":""}>${escapeHtml(league.name)}</option>`).join("");}else{sel.innerHTML=`<option value="${escapeHtml(state.selectedLeagueCode)}">${escapeHtml(state.leagueData.name)}</option>`;}state.activeLeagueTable=state.selectedLeagueCode;}
function switchLeagueTable(){state.activeLeagueTable=document.getElementById("leagueTableSelector")?.value||state.selectedLeagueCode;renderTable();}

async function saveCareer(){if(!state.team)return;try{const payload=serializeState();await apiPost("/api/save",payload);const label=state.coachName?`${state.coachName} - ${state.team.name}`:state.team.name;state.saveStatus=` Zapisano: ${label}`;}catch(e){state.saveStatus=` Blad zapisu: ${e.message}`;}updateSaveStatus();}
async function loadCareer(){let p;try{p=await apiGet("/api/save");}catch(e){state.saveStatus=" Blad ladowania: serwer nie odpowiada.";updateSaveStatus();return;}if(!p||!p.exists){state.saveStatus=" Brak zapisu na serwerze.";updateSaveStatus();return;}if(!p.state){state.saveStatus=" Uszkodzony zapis.";updateSaveStatus();return;}try{await applySavedState(p.state);}catch(e){state.saveStatus=" Blad wczytywania: "+e.message;updateSaveStatus();return;}if(!state.uefaData){try{const u=await apiGet("/api/uefa");state.uefaData=u;if(u&&u.rankings){state.uefaPoints={};u.rankings.forEach(r=>{state.uefaPoints[r.competition_code]=r.coefficient;});}}catch(e){}}}
function serializeState(){return{selectedLeagueCode:state.selectedLeagueCode,teamId:state.team.club_id,coachName:state.coachName||"",currentDate:toIsoDate(state.currentDate),calendarDate:toIsoDate(state.calendarDate),budgetMillions:state.budgetMillions,wageBudgetMillions:state.wageBudgetMillions,formation:state.formation,tactics:state.tactics,seasonFinished:state.seasonFinished,transferWindow:state.transferWindow,players:state.players,lineupIds:state.lineup.map((p)=>p.id),benchIds:state.bench.map((p)=>p.id),table:state.table,fixtures:state.fixtures,results:state.results,news:state.news,matchLog:state.matchLog,leagueTables:state.leagueTables,leagueFixtures:state.leagueFixtures,uefaData:state.uefaData,uefaPoints:state.uefaPoints};}

async function applySavedState(snapshot){const ld=deepClone(await loadLeague(snapshot.selectedLeagueCode));state.selectedLeagueCode=snapshot.selectedLeagueCode;state.leagueData=ld;state.allTeams=ld.clubs;state.team=ld.clubs.find((c)=>c.club_id===String(snapshot.teamId))||ld.clubs[0];state.coachName=snapshot.coachName||"";state.players=snapshot.players;state.formation=snapshot.formation||"4-3-3";state.tactics=snapshot.tactics||{style:"balanced",pressing:"medium",width:"normal"};state.budgetMillions=snapshot.budgetMillions;state.wageBudgetMillions=snapshot.wageBudgetMillions;state.currentDate=fromIsoDate(snapshot.currentDate);state.calendarDate=fromIsoDate(snapshot.calendarDate);state.seasonFinished=!!snapshot.seasonFinished;state.transferWindow=snapshot.transferWindow||null;state.table=snapshot.table;state.fixtures=snapshot.fixtures;state.results=snapshot.results;state.news=snapshot.news;state.matchLog=snapshot.matchLog;state.lineup=snapshot.lineupIds.map((id)=>state.players.find((p)=>p.id===id)).filter(Boolean);state.bench=snapshot.benchIds.map((id)=>state.players.find((p)=>p.id===id)).filter(Boolean);if(snapshot.leagueTables)state.leagueTables=snapshot.leagueTables;if(snapshot.leagueFixtures)state.leagueFixtures=snapshot.leagueFixtures;if(snapshot.uefaData)state.uefaData=snapshot.uefaData;if(snapshot.uefaPoints)state.uefaPoints=snapshot.uefaPoints;
    // Szybkie renderowanie przed załadowaniem transferów
    renderFormationButtons();updateTacticsInputs();updateNav();await fillLeagueTableSelector();renderAll();
    document.getElementById("startScreen").style.display="none";document.getElementById("teamSelect").style.display="none";
    // Transfery i ligi w tle
    state._transfersLoaded = false;
    prepareTransferPool().then(()=>{fillTransferFilterOptions();renderTransfers();}).catch(()=>{});
    if(!state.allLeagueData){loadAllLeagues().then(d=>{state.allLeagueData=d;if(!snapshot.leagueTables){initAllLeagueTables();generateAllLeagueFixtures(2025);}fillLeagueTableSelector();renderTable();}).catch(()=>{});}
}

async function loadGameFromFile(event){const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=async(e)=>{try{const data=JSON.parse(e.target.result);const container=document.getElementById("gameContainer");if(container&&!container.innerHTML.trim()){const resp=await fetch("/career.html");if(!resp.ok)throw new Error("Blad ladowania szablonu ("+resp.status+")");container.innerHTML=await resp.text();container.style.display="block";injectGameplayStyles();}await applySavedState(data);state.saveStatus=` Wczytano z pliku: ${file.name}`;updateSaveStatus();}catch(err){state.saveStatus=` Blad: ${err.message}`;updateSaveStatus();}};reader.readAsText(file);event.target.value="";}

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
        addNews(`👋 Emerytura: ${retired.map(p => p.name).join(', ')} zakończyli karierę.`);
        generateYouthPlayers(retired.length);
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

// Mapa tier → bazowy budżet startowy i premia sezonowa
const LEAGUE_TIERS = {
    // Tier 1 – wielkie ligi europejskie
    GB1:{ tier:1, startBudget:120, label:"Premier League" },
    ES1:{ tier:1, startBudget:100, label:"La Liga" },
    IT1:{ tier:1, startBudget:95,  label:"Serie A" },
    DE1:{ tier:1, startBudget:90,  label:"Bundesliga" },
    FR1:{ tier:1, startBudget:85,  label:"Ligue 1" },
    // Tier 2 – średnie ligi
    PO1:{ tier:2, startBudget:45,  label:"Primeira Liga" },
    NL1:{ tier:2, startBudget:42,  label:"Eredivisie" },
    RU1:{ tier:2, startBudget:40,  label:"Premier Liga RU" },
    TR1:{ tier:2, startBudget:38,  label:"Süper Lig" },
    BE1:{ tier:2, startBudget:32,  label:"Jupiler Pro" },
    // Tier 3 – mniejsze ligi
    PL1:{ tier:3, startBudget:18,  label:"Ekstraklasa" },
    SC1:{ tier:3, startBudget:20,  label:"Scottish Premiership" },
    GR1:{ tier:3, startBudget:16,  label:"Super League" },
    DK1:{ tier:3, startBudget:14,  label:"Superliga DK" },
    // Tier 4 – liga krajowa
    default:{ tier:4, startBudget:8, label:"Liga" },
};

function getLeagueTier() {
    const code = (state.selectedLeagueCode || "").toUpperCase();
    return LEAGUE_TIERS[code] || LEAGUE_TIERS.default;
}

function getCounterpartLeague(code, direction) {
    const upper = code.toUpperCase();
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

// --- KONIEC SEZONU ---

function getEuropeanQualification() {
    const code = state.selectedLeagueCode;
    const tierInfo = getLeagueTier();
    if (tierInfo.tier > 1) return null;
    const uefa = getUefaForLeague(code);
    if (!uefa) return null;
    const tbl = state.table;
    const pos = tbl.findIndex(r => r.clubId === state.team.club_id);
    const n = tbl.length;
    const totalSpots = uefa.total_spots || 0;
    if (totalSpots === 0 || pos < 0) return null;

    const spots = [];
    let s = 0;
    if (uefa.ucl_spots > 0) { spots.push({ name: 'Liga Mistrzów', short: 'LM', color: '#1a47b8', pos: '1-' + uefa.ucl_spots, end: s + uefa.ucl_spots }); s += uefa.ucl_spots; }
    if (uefa.uel_spots > 0) { spots.push({ name: 'Liga Europy', short: 'LE', color: '#f97316', pos: (s+1) + '-' + (s+uefa.uel_spots), end: s + uefa.uel_spots }); s += uefa.uel_spots; }
    if (uefa.uecl_spots > 0) { spots.push({ name: 'Liga Konferencji', short: 'LK', color: '#22c55e', pos: (s+1) + '-' + (s+uefa.uecl_spots), end: s + uefa.uecl_spots }); }

    for (const spot of spots) {
        if (pos < spot.end) return spot;
    }
    return null;
}

async function applyAllPromotionsRelegations() {
    if (!state.allLeagueData) return;
    const processed = new Set();

    for (const [code, tbl] of Object.entries(state.leagueTables)) {
        if (processed.has(code)) continue;

        const partner = getCounterpartLeague(code, 'down') || getCounterpartLeague(code, 'up');
        if (!partner || !state.leagueTables[partner]) continue;
        if (processed.has(partner)) continue;

        processed.add(code);
        processed.add(partner);

        const [upperCode, lowerCode] = code.endsWith('1') ? [code, partner] : [partner, code];

        const upperTbl = state.leagueTables[upperCode];
        const lowerTbl = state.leagueTables[lowerCode];
        const upperLeagueData = state.allLeagueData[upperCode];
        const lowerLeagueData = state.allLeagueData[lowerCode];
        if (!upperTbl || !lowerTbl || !upperLeagueData || !lowerLeagueData) continue;

        const nUpper = upperTbl.length;
        const nLower = lowerTbl.length;
        const baseMove = Math.min(
            Math.floor(nUpper * 0.15), Math.floor((nUpper - 2) / 2),
            Math.floor(nLower * 0.15), Math.floor((nLower - 2) / 2)
        );
        const moveCount = Math.max(1, baseMove);

        const sortFn = (a, b) => (b.points - a.points) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf) || a.name.localeCompare(b.name, 'pl');
        const sortedUpper = [...upperTbl].sort(sortFn);
        const sortedLower = [...lowerTbl].sort(sortFn);

        const relegateIds = sortedUpper.slice(nUpper - moveCount).map(r => r.clubId);
        const promoteIds = sortedLower.slice(0, moveCount).map(r => r.clubId);
        if (promoteIds.length !== relegateIds.length) continue;

        for (const cid of promoteIds) {
            const clubIdx = lowerLeagueData.clubs.findIndex(c => String(c.club_id) === String(cid));
            if (clubIdx >= 0) {
                const [club] = lowerLeagueData.clubs.splice(clubIdx, 1);
                upperLeagueData.clubs.push(club);
            }
            const rowIdx = lowerTbl.findIndex(r => r.clubId === String(cid));
            if (rowIdx >= 0) {
                const [row] = lowerTbl.splice(rowIdx, 1);
                upperTbl.push({ ...row, played:0, won:0, drawn:0, lost:0, gf:0, ga:0, points:0, form:[] });
            }
        }

        for (const cid of relegateIds) {
            const clubIdx = upperLeagueData.clubs.findIndex(c => String(c.club_id) === String(cid));
            if (clubIdx >= 0) {
                const [club] = upperLeagueData.clubs.splice(clubIdx, 1);
                lowerLeagueData.clubs.push(club);
            }
            const rowIdx = upperTbl.findIndex(r => r.clubId === String(cid));
            if (rowIdx >= 0) {
                const [row] = upperTbl.splice(rowIdx, 1);
                lowerTbl.push({ ...row, played:0, won:0, drawn:0, lost:0, gf:0, ga:0, points:0, form:[] });
            }
        }
    }
}

function getSeasonOutcome() {
    const tbl = state.table;
    const pos = tbl.findIndex(r => r.clubId === state.team.club_id);
    const n = tbl.length;
    const tier = getLeagueTier().tier;
    const scale = tier === 1 ? 5 : tier === 2 ? 2.5 : tier === 3 ? 1.5 : 1;
    const partner=getCounterpartLeague(state.selectedLeagueCode,'down')||getCounterpartLeague(state.selectedLeagueCode,'up');
    const nPartner=partner&&state.leagueTables[partner]?state.leagueTables[partner].length:n;
    const moveCount=Math.max(1,Math.min(Math.floor(n*0.15),Math.floor((n-2)/2),Math.floor(nPartner*0.15),Math.floor((nPartner-2)/2)));
    const BC = (v) => round2(v * scale);

    const europe = getEuropeanQualification();

    if (pos === 0) {
        const promoType = tier > 1 ? 'promoted' : 'champion';
        return { type: promoType, label:'MISTRZ LIGI', color:'#fbbf24', icon:'🏆', budget: BC(15), europe };
    }
    if (pos < moveCount)         return { type:'promoted', label:'AWANS',        color:'#10b981', icon:'⬆️', budget: BC(8), europe };
    if (pos >= n - moveCount)    return { type:'relegated',label:'SPADEK',       color:'#ef4444', icon:'⬇️', budget: BC(-6), europe: null };
    return                            { type:'mid',      label:`MIEJSCE ${pos+1}`, color:'#9ca3af', icon:'🏟️', budget: BC(2), europe };
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

    const isChampAndPromo = outcome.type === 'promoted' && outcome.icon === '🏆';
    let newsText;
    if (isChampAndPromo) {
        newsText = `🏆 MISTRZOWIE! ${state.team.name} zdobywa mistrzostwo i awansuje!`;
    } else {
        newsText = {
            champion: `🏆 MISTRZOWIE! ${state.team.name} zdobywa mistrzostwo ligi!`,
            promoted:  `⬆️ AWANS! ${state.team.name} awansuje do wyższej klasy!`,
            relegated: `⬇️ SPADEK. ${state.team.name} spada z ligi.`,
            mid: `Sezon zakończony na miejscu ${state.table.findIndex(r=>r.clubId===state.team.club_id)+1}.`,
        }[outcome.type];
    }

    restartSeason(newsText);
    state.transferWindow = "summer";
}

function restartSeason(customNews) {
    const seasonStartMonth = 6;
    let ny = state.currentDate.getFullYear();
    if (state.currentDate.getMonth() >= seasonStartMonth) ny += 1;
    state.currentDate = new Date(ny, seasonStartMonth, 1);
    state.calendarDate = new Date(ny, seasonStartMonth, 1);
    state.seasonFinished = false;
    state.transferWindow = null;
    state.results = []; state.news = []; state.matchLog = [];
    agePlayers(); generateYouthPlayers(3);
    state.players.forEach(p => { p.matches=0; p.goals=0; p.assists=0; p.fitness=96; p.morale=82; });
    generateFixtures(ny); initTable();
    if (state.selectedLeagueCode && state.leagueData) {
        initLeagueTable(state.selectedLeagueCode, state.leagueData);
    }
    autoPick();
    addNews(customNews || `Startuje sezon ${ny}/${ny+1}.`);
    addNews(`Startuje sezon ${ny}/${ny+1}. Budżet: €${formatMoney(state.budgetMillions)}M`);
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
    const c=document.getElementById("modalContent");
    c.innerHTML=`<div style="text-align:center;"><div style="font-size:.75rem;text-transform:uppercase;font-weight:700;color:${color};letter-spacing:.1em;margin-bottom:.5rem;">${result}</div><div style="display:flex;align-items:center;justify-content:center;gap:1rem;margin-bottom:1rem;"><div style="text-align:center;"><div style="width:60px;height:60px;border-radius:50%;background:${h.color};margin:0 auto .3rem;background-image:url('${h.logo_url}');background-size:76%;background-repeat:no-repeat;background-position:center;"></div><div style="font-size:.8rem;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(h.name)}</div></div><div style="font-size:2.5rem;font-weight:900;color:#fff;padding:0 .5rem;">${fx.homeGoals}:${fx.awayGoals}</div><div style="text-align:center;"><div style="width:60px;height:60px;border-radius:50%;background:${a.color};margin:0 auto .3rem;background-image:url('${a.logo_url}');background-size:76%;background-repeat:no-repeat;background-position:center;"></div><div style="font-size:.8rem;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(a.name)}</div></div></div><div style="color:var(--muted);font-size:.85rem;margin-bottom:1.5rem;">${state.matchLog[0]||""}</div><div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;"><button class="btn btn-primary" onclick="closeModal()">OK</button><button class="btn btn-accent" onclick="simulateDay();closeModal();"><i class="fi fi-rr-forward"></i> Kontynuuj</button></div></div>`;
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
</div>
<div>
<p><strong> Kondycja:</strong> ${player.fitness}%</p>
<p><strong> Morale:</strong> ${player.morale}%</p>
<p><strong> Mecze:</strong> ${player.matches}</p>
<p><strong> Gole:</strong> ${player.goals}</p>
</div>
</div>
<div style="margin-top:1rem;padding-top:.8rem;border-top:1px solid var(--border);">
<p style="font-size:.78rem;font-weight:700;color:var(--muted);margin:0 0 .4rem 0;">Szczegóły oceny</p>
<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem;"><span style="font-size:.72rem;color:var(--muted);width:80px;">Bazowa:</span><span style="font-size:.78rem;">${rb}</span>${barW(rb)}</div>
${re>0?`<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem;"><span style="font-size:.72rem;color:var(--muted);width:80px;">Doświadczenie:</span><span style="font-size:.78rem;color:#fbbf24;">+${re}</span>${barW(re)}</div>`:""}
${potBar}
</div>
<div class="action-stack" style="margin-top:1.5rem;">
<button class="btn btn-secondary" onclick="closeModal()"> Zamknij</button>
${starter?"":`<button class="btn btn-red" onclick="sellPlayer(${player.id});closeModal();">€ Sprzedaj</button>`}
</div>`;document.getElementById("modal").classList.add("active");}
function sellPlayer(playerId){const idx=state.players.findIndex((p)=>p.id===playerId);if(idx<0)return;const p=state.players[idx];const fee=round2(p.valueMillions*0.78);state.budgetMillions=round2(state.budgetMillions+fee);state.wageBudgetMillions=round2(state.wageBudgetMillions+p.wageMillions);state.players.splice(idx,1);state.lineup=state.lineup.filter((pl)=>pl.id!==playerId);state.bench=state.bench.filter((pl)=>pl.id!==playerId);autoPick();addNews(`€ ${p.name} odchodzi za €${formatMoney(fee)}M`);renderAll();}
function addNews(text){state.news.push({date:formatDateLong(state.currentDate),text});}
function getClub(id){return state.allTeams.find((c)=>c.club_id===String(id));}
function getTableRow(cid){return state.table.find((r)=>r.clubId===String(cid));}
function getFixturesByDate(iso){return state.fixtures.filter((f)=>f.date===iso);}
function getUserFixtures(){return state.fixtures.filter((f)=>isUserFixture(f));}
function getUserFixtureByDate(iso){return state.fixtures.find((f)=>f.date===iso&&isUserFixture(f));}
function getUserResults(){return state.results.filter((r)=>r.userMatch);}
function remainingUserFixtures(){return getUserFixtures().filter((f)=>!f.played).length;}
function hasPendingFixturesOnDate(iso){return getFixturesByDate(iso).some((f)=>!f.played);}
function allFixturesPlayed(){return state.fixtures.every((f)=>f.played);}
function isPastSeasonEnd(){const d=state.currentDate;if(!state.fixtures||!state.fixtures[0]||!state.fixtures[0].date)return false;const seasonStartYear=parseInt(state.fixtures[0].date.split("-")[0]);const seasonEnd=new Date(seasonStartYear+1,5,30);return d>=seasonEnd;}
function isUserFixture(f){return f.homeClubId===state.team.club_id||f.awayClubId===state.team.club_id;}
function describeDay(){const d=state.currentDate.getDay();if(d===1)return"Regeneracja";if(d===2||d===4)return"Trening taktyczny";if(d===3)return"Analiza przeciwnika";if(d===5)return"Przygotowanie meczowe";return"Dzien klubowy";}
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