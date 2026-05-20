const cache = { bootstrap: null, leagues: new Map(), transfers: null, allLeagues: null };

const state = {
    leagueCarouselStart: 0, teamCarouselStart: 0,
    leaguePageSize: 5, teamPageSize: 5,
    pendingLeagueData: null, selectedLeagueCode: null,
    leagueData: null, team: null, allTeams: [],
    coachName: "", modalClubId: null,
    players: [], lineup: [], bench: [],
    formation: "4-3-3",
    tactics: { style: "balanced", pressing: "medium", width: "normal" },
    table: [], fixtures: [], results: [], news: [], matchLog: [],
    currentDate: null, calendarDate: null, calendarTargetDate: null, seasonFinished: false,
    budgetMillions: 0, wageBudgetMillions: 0,
    transferPlayers: [], transferFilter: "all",
    transferQuery: "", transferAgeMax: "", transferClub: "", transferLeague: "",
    dragPlayerId: null, dragSource: null,
    reserves: [],
    simulating: false, simTimer: null, simMode: "none",
    saveStatus: "Brak zapisu w tej sesji.",
    allLeagueData: null, leagueTables: {}, leagueFixtures: {}, activeLeagueTable: null,
    uefaData: null,
    uefaPoints: {},
    transferWindow: null,
};

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
    try {
        const [bootstrap, saveData] = await Promise.all([loadBootstrap(), loadSavedCareer()]);
        cache.bootstrap = bootstrap;
        renderLeagueSelector();
        if (saveData.exists) {
            state.saveStatus = "Znaleziono zapis kariery na serwerze.";
            const s = document.getElementById("saveStatus");
            if (s) s.textContent = state.saveStatus;
        }

    } catch (error) {
        console.error(error);
        document.getElementById("leagueTrack").innerHTML = `
            <div class="league-card"><h3>Blad ladowania</h3><p>${escapeHtml(error.message)}</p></div>`;
    }
}



const IS_STATIC = !location.hostname.includes('localhost') && location.hostname !== '127.0.0.1';

function staticApiPath(path) {
    if (path === '/api/bootstrap') return '/data/bootstrap.json';
    if (path === '/api/transfers') return '/data/transfers.json';
    if (path === '/api/leagues') return '/data/leagues.json';
    if (path === '/api/uefa') return '/data/uefa.json';
    if (path === '/api/save' || path === '/api/save-exists') return null;
    const m = path.match(/^\/api\/league\/(.+)$/);
    if (m) return `/data/league/${m[1]}.json`;
    return path;
}

async function apiGet(url) {
    const sp = IS_STATIC ? staticApiPath(url) : url;
    if (sp === null) {
        if (url === '/api/save-exists') return { exists: false };
        if (url === '/api/save') return { exists: false };
        return null;
    }
    const r = await fetch(sp);
    if (!r.ok) throw new Error(`Blad serwera dla ${url}`);
    return r.json();
}
async function apiPost(url, payload) {
    if (IS_STATIC) throw new Error('Zapis niedostepny w wersji statycznej');
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(`Blad serwera dla ${url}`);
    return r.json();
}

async function loadBootstrap() {
    if (cache.bootstrap) return cache.bootstrap;
    cache.bootstrap = await apiGet("/api/bootstrap");
    return cache.bootstrap;
}
async function loadLeague(code) {
    const n = String(code).toUpperCase();
    if (cache.leagues.has(n)) return cache.leagues.get(n);
    const d = await apiGet(`/api/league/${n}`);
    cache.leagues.set(n, d);
    return d;
}
async function loadTransfers() {
    if (cache.transfers) return cache.transfers;
    const p = await apiGet("/api/transfers");
    cache.transfers = p.players;
    return cache.transfers;
}
async function loadAllLeagues() {
    if (cache.allLeagues) return cache.allLeagues;
    cache.allLeagues = await apiGet("/api/leagues");
    return cache.allLeagues;
}
async function loadSavedCareer() { return apiGet("/api/save-exists"); }

function renderLeagueSelector() {
    const leagues = cache.bootstrap.leagues || [];
    const track = document.getElementById("leagueTrack");
    if (!track.dataset.rendered) {
        track.innerHTML = leagues.map((l) => `
            <div class="league-card" onclick="selectLeague('${escapeHtml(l.competition_code)}')">
                <div><img class="league-logo" src="${l.league_logo_url}" alt="${escapeHtml(l.name)}" loading="lazy"><h3>${escapeHtml(l.name)}</h3></div>
            </div>
        `).join("");
        track.dataset.rendered = "1";
    }
    const cardW = track.querySelector(".league-card")?.offsetWidth || 280;
    const step = cardW + 20;
    track.style.transform = `translateX(-${state.leagueCarouselStart * step}px)`;
}
function scrollLeagueCarousel(direction) {
    const maxStart = Math.max(0, (cache.bootstrap?.leagues?.length || 0) - state.leaguePageSize);
    state.leagueCarouselStart = clamp(state.leagueCarouselStart + direction, 0, maxStart);
    const cardW = document.querySelector("#leagueTrack .league-card")?.offsetWidth || 280;
    const step = cardW + 20;
    document.getElementById("leagueTrack").style.transform = `translateX(-${state.leagueCarouselStart * step}px)`;
}

async function selectLeague(code) {
    state.selectedLeagueCode = code;
    state.pendingLeagueData = deepClone(await loadLeague(code));
    state.teamCarouselStart = 0;
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("teamSelect").style.display = "block";
    document.getElementById("teamSelectTitle").textContent = "Wybierz drużynę";
    const logo = document.getElementById("teamSelectLeagueLogo");
    if (logo) logo.src = state.pendingLeagueData.league_logo_url || "";
    const track = document.getElementById("teamGrid");
    delete track.dataset.rendered;
    renderTeamGrid();
}
function backToStart() {
    document.getElementById("teamSelect").style.display = "none";
    document.getElementById("startScreen").style.display = "flex";
}

function getMiddleClubIndex() {
    return state.teamCarouselStart + Math.floor(state.teamPageSize / 2);
}

let _teamScrolling = false;
const TEAM_SCROLL_DURATION = 500;

function renderTeamGrid() {
    const track = document.getElementById("teamGrid");
    const container = document.querySelector(".team-select-inner");
    const clubs = [...state.pendingLeagueData.clubs].sort((a, b) => b.avg_rating - a.avg_rating);
    const needsRebuild = !track.dataset.rendered;
    if (needsRebuild) {
        track.innerHTML = "";
        track.style.transform = "none";
        clubs.forEach((club, idx) => {
            const card = document.createElement("div");
            card.className = "team-card";
            card.dataset.index = idx;
            card.onclick = () => showCoachModal(club.club_id);
            card.style.background = `linear-gradient(145deg, rgba(0,0,0,0.92) 0%, ${club.color}22 50%, rgba(0,0,0,0.95) 100%)`;
            card.style.borderColor = `${club.color}44`;
            card.innerHTML = `
                <div class="team-card-glow" style="background:${club.color};"></div>
                <div class="team-logo" style="background:${club.color}; background-image:url('${club.logo_url}'); background-size:84%; background-repeat:no-repeat; background-position:center;">
                    ${club.logo_url ? "" : escapeHtml(initials(club.name))}
                </div>
                <h4>${escapeHtml(club.name)}</h4>
                <div class="team-meta-list" style="align-items:center;">
                    <span class="stat-chip"><i class="fi fi-sr-star"></i> ${club.avg_rating} OVR</span>
                    <span class="stat-chip budget-chip"><i class="fi fi-br-money-bills-simple"></i> €${formatMoney(club.budget_millions)} mln</span>
                </div>`;
            track.appendChild(card);
        });
        track.dataset.rendered = "1";
        track.offsetHeight;
    }
    const middleIdx = clamp(getMiddleClubIndex(), 0, clubs.length - 1);
    const allCards = track.querySelectorAll(".team-card");
    if (!allCards.length) return;
    allCards.forEach((card, i) => card.classList.toggle("team-card-active", i === middleIdx));
    const activeClub = clubs[middleIdx];
    if (container && activeClub) {
        container.style.background = `
            radial-gradient(ellipse 100% 60% at 50% 50%, ${activeClub.color}15 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 30% 100%, rgba(16,185,129,0.05) 0%, transparent 50%),
            linear-gradient(180deg, #050810 0%, #080c1a 100%)`;
    }
    const cardW = allCards[0].offsetWidth || 260;
    const step = cardW + 24;
    const viewW = track.parentElement.offsetWidth || 1200;
    const offset = (viewW / 2) - (cardW / 2) - (middleIdx * step);
    if (needsRebuild) {
        track.style.transition = "none";
        track.style.transform = `translateX(${offset}px)`;
        track.offsetHeight;
        track.style.transition = "";
    } else {
        track.style.transform = `translateX(${offset}px)`;
    }
    setTimeout(() => { _teamScrolling = false; }, TEAM_SCROLL_DURATION);
}
function scrollTeamCarousel(direction) {
    if (_teamScrolling) return;
    _teamScrolling = true;
    state.teamCarouselStart += direction;
    renderTeamGrid();
}

function showCoachModal(clubId) {
    state.modalClubId = clubId;
    const content = document.getElementById("modalContent");
    const team = state.pendingLeagueData.clubs.find((c) => c.club_id === String(clubId));
    if (!team) return;
    const saved = JSON.parse(localStorage.getItem("pw_coach_names") || "[]");
    content.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">
                <span style="display:inline-block;width:80px;height:80px;border-radius:50%;background:${team.color};background-image:url('${team.logo_url}');background-size:78%;background-repeat:no-repeat;background-position:center;"></span>
            </div>
            <h2 style="margin-bottom:0.3rem;">${escapeHtml(team.name)}</h2>
            <p style="color:var(--text-muted);margin-bottom:1.5rem;">Podaj nazwisko trenera</p>
            <input type="text" id="coachNameInput" placeholder="Np. Adam Nawałka" maxlength="40"
                style="width:100%;padding:1rem 1.2rem;border-radius:14px;border:1px solid var(--border);background:var(--bg-hover);color:var(--text);font-size:1.1rem;text-align:center;margin-bottom:1rem;outline:none;"
                onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'"
                onkeydown="if(event.key==='Enter') confirmCoach()">
            <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:1rem;">
                ${saved.slice(0,5).map((n) => `<button class="btn btn-secondary btn-sm" onclick="document.getElementById('coachNameInput').value='${escapeHtml(n)}'">${escapeHtml(n)}</button>`).join("")}
            </div>
            <div class="action-stack" style="justify-content:center;">
                <button class="btn btn-primary" onclick="confirmCoach()"><i class="fi fi-br-play-alt"></i> Rozpocznij karierę</button>
                <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
            </div>
        </div>`;
    document.getElementById("modal").classList.add("active");
    setTimeout(() => document.getElementById("coachNameInput")?.focus(), 200);
}

async function confirmCoach() {
    const input = document.getElementById("coachNameInput");
    state.coachName = input?.value?.trim() || "Trener";
    const saved = JSON.parse(localStorage.getItem("pw_coach_names") || "[]");
    if (!saved.includes(state.coachName) && state.coachName !== "Trener") {
        saved.unshift(state.coachName);
        localStorage.setItem("pw_coach_names", JSON.stringify(saved.slice(0, 10)));
    }
    closeModal();
    await startCareer(state.modalClubId);
}

async function startCareer(clubId) {
    const leagueData = deepClone(state.pendingLeagueData);
    const team = leagueData.clubs.find((c) => c.club_id === String(clubId));
    if (!team) return;
    state.leagueData = leagueData;
    state.team = team;
    state.allTeams = leagueData.clubs;
    document.getElementById("teamSelect").style.display = "none";

    showGlobalLoading();

    const container = document.getElementById("gameContainer");
    container.style.display = "block";
    try {
        const resp = await fetch("/career.html");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const html = await resp.text();
        container.innerHTML = html;
        await initCareer();
    } catch (e) {
        hideGlobalLoading();
        container.innerHTML = `
            <div style="padding:3rem;text-align:center;">
                <div style="font-size:2rem;margin-bottom:1rem;">⚠️</div>
                <h2>Błąd ładowania gry</h2>
                <p style="color:#9ca3af;margin-bottom:1.5rem;">${escapeHtml(e.message)}</p>
                <button class="btn btn-secondary" onclick="location.reload()">Odśwież stronę</button>
            </div>`;
    }
}

function closeModal() { document.getElementById("modal")?.classList.remove("active"); }

function escapeHtml(v) { return String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;"); }
function initials(name) { return String(name||"").split(" ").slice(0,2).map((p)=>p[0]||"").join("").toUpperCase(); }
function formatMoney(v) { return Number(v||0).toFixed(2); }
function clamp(v,min,max) { return Math.max(min,Math.min(max,v)); }
function deepClone(v) { return JSON.parse(JSON.stringify(v)); }
function round2(v) { return Math.round(Number(v||0)*100)/100; }
