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

const COUNTRY_CODES = {
  'polska':'PL','anglia':'GB','anglika':'GB','wielka brytania':'GB','szkocja':'GB',
  'niemcy':'DE','hiszpania':'ES','włochy':'IT','francja':'FR','holandia':'NL',
  'portugalia':'PT','belgia':'BE','austria':'AT','szwajcaria':'CH','dania':'DK',
  'szwecja':'SE','norwegia':'NO','finlandia':'FI','rosja':'RU','ukraina':'UA',
  'turcja':'TR','grecja':'GR','chorwacja':'HR','serbia':'RS','czechy':'CZ','czesko':'CZ',
  'słowacja':'SK','słowenia':'SI','węgry':'HU','rumunia':'RO','bułgaria':'BG',
  'usa':'US','meksyk':'MX','mexyk':'MX','brazylia':'BR','argentyna':'AR','chile':'CL',
  'japonia':'JP','korea':'KR','chiny':'CN','arabia saudyjska':'SA',
  'zea':'AE','zjednoczone emiraty arabskie':'AE','katar':'QA','australia':'AU',
  'irlandia':'IE','izrael':'IL','cypr':'CY',
  'albania':'AL','bośnia':'BA','czarnogóra':'ME','macedonia':'MK','kosowo':'XK',
  'litwa':'LT','łotwa':'LV','estonia':'EE','białoruś':'BY','mołdawia':'MD',
  'kazachstan':'KZ','azerbejdżan':'AZ','armenia':'AM','gruzja':'GE',
  'inne':'WW'
};

function countryToFlag(countryName) {
  const c = (countryName||'').toLowerCase().trim();
  if (COUNTRY_CODES[c]) {
    const code = COUNTRY_CODES[c];
    if (code === 'XX' || code === 'WW') return '🌍';
    return String.fromCodePoint(0x1F1E6 + code.charCodeAt(0) - 65, 0x1F1E6 + code.charCodeAt(1) - 65);
  }
  for (const [key, val] of Object.entries(COUNTRY_CODES)) {
    if (c.includes(key) || key.includes(c)) {
      if (val === 'XX' || val === 'WW') return '🌍';
      return String.fromCodePoint(0x1F1E6 + val.charCodeAt(0) - 65, 0x1F1E6 + val.charCodeAt(1) - 65);
    }
  }
  return '🌍';
}

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
        document.getElementById("leagueGrid").innerHTML = `
            <p style="color:var(--text-muted);text-align:center;padding:2rem;">Błąd ładowania: ${escapeHtml(error.message)}</p>`;
    }
}



async function apiGet(url) {
    const fileMap = {
        "/api/bootstrap": "./data/bootstrap.json",
        "/api/transfers": "./data/transfers.json",
        "/api/leagues":   "./data/leagues.json",
        "/api/uefa":      "./data/uefa.json",
    };
    if (fileMap[url] !== undefined) {
        const r = await fetch(fileMap[url]);
        if (!r.ok) throw new Error(`Błąd ładowania ${url}`);
        return r.json();
    }
    if (url.startsWith("/api/league/")) {
        const code = url.split("/").pop().toUpperCase();
        const r = await fetch(`./data/league_${code}.json`);
        if (!r.ok) throw new Error(`Błąd ładowania ligi ${code}`);
        return r.json();
    }
    if (url === "/api/save-exists") {
        const data = localStorage.getItem("pw_career_save");
        return { exists: data !== null };
    }
    if (url === "/api/save") {
        const data = localStorage.getItem("pw_career_save");
        if (data === null) return { exists: false };
        return { exists: true, state: JSON.parse(data) };
    }
    throw new Error(`Nieznany endpoint: ${url}`);
}
async function apiPost(url, payload) {
    if (url === "/api/save") {
        localStorage.setItem("pw_career_save", JSON.stringify(payload));
        return { ok: true, path: "localStorage" };
    }
    throw new Error(`Nieznany endpoint POST: ${url}`);
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
    cache.transfers = p.players || p;
    return cache.transfers;
}
async function loadAllLeagues() {
    if (cache.allLeagues) return cache.allLeagues;
    cache.allLeagues = await apiGet("/api/leagues");
    return cache.allLeagues;
}
async function loadSavedCareer() { return apiGet("/api/save-exists"); }

function getCountryGroups() {
    const leagues = cache.bootstrap?.leagues || [];
    const map = new Map();
    leagues.forEach(l => {
        const c = l.country || 'Inne';
        if (!map.has(c)) map.set(c, []);
        map.get(c).push(l);
    });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}

// ============================================================
// COUNTRY → LEAGUE → TEAM selection (full-screen carousels)
// ============================================================

const COUNTRY_CODES_ISO2 = {
  'polska':'pl','anglia':'gb','wielka brytania':'gb','szkocja':'gb-sct',
  'niemcy':'de','hiszpania':'es','włochy':'it','francja':'fr','holandia':'nl',
  'portugalia':'pt','belgia':'be','austria':'at','szwajcaria':'ch','dania':'dk',
  'szwecja':'se','norwegia':'no','finlandia':'fi','rosja':'ru','ukraina':'ua',
  'turcja':'tr','grecja':'gr','chorwacja':'hr','serbia':'rs','czechy':'cz',
  'słowacja':'sk','słowenia':'si','węgry':'hu','rumunia':'ro','bułgaria':'bg',
  'usa':'us','meksyk':'mx','brazylia':'br','argentyna':'ar','chile':'cl',
  'japonia':'jp','korea':'kr','chiny':'cn','arabia saudyjska':'sa',
  'zea':'ae','katar':'qa','australia':'au','irlandia':'ie','izrael':'il','cypr':'cy',
  'albania':'al','bośnia':'ba','czarnogóra':'me','macedonia':'mk','kosowo':'xk',
  'litwa':'lt','łotwa':'lv','estonia':'ee','białoruś':'by','mołdawia':'md',
  'kazachstan':'kz','azerbejdżan':'az','armenia':'am','gruzja':'ge',
};

function getFlagUrl(countryName) {
  const c = (countryName||'').toLowerCase().trim();
  let code = COUNTRY_CODES_ISO2[c];
  if (!code) {
    for (const [key, val] of Object.entries(COUNTRY_CODES_ISO2)) {
      if (c.includes(key) || key.includes(c)) { code = val; break; }
    }
  }
  if (!code) return '';
  // flagcdn.com — darmowe flagi PNG
  return `https://flagcdn.com/w80/${code}.png`;
}

// --- State dla karuzeli ---
let _countryCarouselIdx = 0;
let _leagueCarouselIdx = 0;
let _countryScrolling = false;
let _leagueScrolling = false;
const CAROUSEL_SCROLL_MS = 500;

function openCountrySelect() {
    document.getElementById('startScreen').style.display = 'none';
    const el = document.getElementById('countrySelect');
    el.style.display = 'block';
    _countryCarouselIdx = 0;
    renderCountryCarousel();
}

function backToStartFromCountry() {
    document.getElementById('countrySelect').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
}

function backToCountrySelect() {
    document.getElementById('leagueSelectorScreen').style.display = 'none';
    document.getElementById('countrySelect').style.display = 'block';
}

function getCountryGroups() {
    const leagues = cache.bootstrap?.leagues || [];
    const map = new Map();
    leagues.forEach(l => {
        const c = l.country || 'Inne';
        if (!map.has(c)) map.set(c, []);
        map.get(c).push(l);
    });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}

function getMiddleCountryIndex() {
    return _countryCarouselIdx + Math.floor(5 / 2);
}

function renderCountryCarousel() {
    const track = document.getElementById('countryGrid');
    const container = document.getElementById('countrySelectInner');
    if (!track) return;
    const groups = getCountryGroups();

    const needsRebuild = !track.dataset.rendered;
    if (needsRebuild) {
        track.innerHTML = '';
        track.style.transform = 'none';
        groups.forEach(([country, leagues], idx) => {
            const flagUrl = getFlagUrl(country);
            const card = document.createElement('div');
            card.className = 'country-card';
            card.dataset.index = idx;
            card.onclick = () => openLeagueSelect(country);
            card.innerHTML = `
                <div class="country-card-glow"></div>
                ${flagUrl
                    ? `<img class="country-flag-img" src="${flagUrl}" alt="${escapeHtml(country)}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
                       <div style="display:none;font-size:2.8rem;margin-bottom:0.9rem;">${countryToFlag(country)}</div>`
                    : `<div style="font-size:2.8rem;margin-bottom:0.9rem;">${countryToFlag(country)}</div>`
                }
                <h4>${escapeHtml(country)}</h4>
                <span class="leagues-count">${leagues.length} lig${leagues.length===1?'a':leagues.length<5?'i':'</span>'}</span>
            `;
            track.appendChild(card);
        });
        track.dataset.rendered = '1';
        track.offsetHeight;
    }

    const middleIdx = clamp(getMiddleCountryIndex(), 0, groups.length - 1);
    const allCards = track.querySelectorAll('.country-card');
    allCards.forEach((card, i) => card.classList.toggle('country-card-active', i === middleIdx));

    const cardW = allCards[0]?.offsetWidth || 260;
    const step = cardW + 24;
    const viewW = track.parentElement?.offsetWidth || 1200;
    const offset = (viewW / 2) - (cardW / 2) - (middleIdx * step);
    if (needsRebuild) {
        track.style.transition = 'none';
        track.style.transform = `translateX(${offset}px)`;
        track.offsetHeight;
        track.style.transition = '';
    } else {
        track.style.transform = `translateX(${offset}px)`;
    }
    const leftBtn = document.getElementById('countryCarouselLeft');
    const rightBtn = document.getElementById('countryCarouselRight');
    if (leftBtn) leftBtn.disabled = middleIdx <= 0;
    if (rightBtn) rightBtn.disabled = middleIdx >= groups.length - 1;
    setTimeout(() => { _countryScrolling = false; }, CAROUSEL_SCROLL_MS);
}

function scrollCountryCarousel(dir) {
    if (_countryScrolling) return;
    _countryScrolling = true;
    _countryCarouselIdx += dir;
    renderCountryCarousel();
}

function openLeagueSelect(country) {
    const groups = getCountryGroups();
    state.selectedCountry = country;
    document.getElementById('countrySelect').style.display = 'none';
    const el = document.getElementById('leagueSelectorScreen');
    el.style.display = 'block';
    _leagueCarouselIdx = 0;
    // Flaga i nazwa kraju w nagłówku
    const flagEl = document.getElementById('leagueSelectFlag');
    const nameEl = document.getElementById('leagueSelectCountryName');
    const flagUrl = getFlagUrl(country);
    if (flagEl) { flagEl.src = flagUrl; flagEl.alt = country; flagEl.style.display = flagUrl ? '' : 'none'; }
    if (nameEl) nameEl.textContent = country;
    renderLeagueCarousel(groups);
}

function renderLeagueCarousel(groups) {
    const track = document.getElementById('leagueGridTrack');
    const container = document.getElementById('leagueSelectorInner');
    if (!track) return;
    const entry = (groups || getCountryGroups()).find(([c]) => c === state.selectedCountry);
    const leagues = entry ? entry[1] : [];

    // Rebuild always (może być nowy kraj)
    track.innerHTML = '';
    track.style.transform = 'none';
    leagues.forEach((l, idx) => {
        const card = document.createElement('div');
        card.className = 'league-card';
        card.dataset.index = idx;
        card.onclick = () => selectLeague(l.competition_code);
        card.innerHTML = `
            <div class="league-card-glow"></div>
            <img class="league-logo" src="${escapeHtml(l.league_logo_url||'')}" alt="${escapeHtml(l.name)}" loading="lazy"
                 onerror="this.style.opacity='0.3'">
            <h4>${escapeHtml(l.name)}</h4>
            <div class="league-meta" style="align-items:center;margin-top:0.5rem;">
                <span class="stat-chip"><i class="fi fi-sr-users"></i> ${l.club_count} klubów</span>
                <span class="stat-chip"><i class="fi fi-sr-star"></i> Poziom ${l.level||'?'}</span>
            </div>
        `;
        track.appendChild(card);
    });
    track.offsetHeight;
    _updateLeagueCarouselPosition(leagues.length);
}

function _updateLeagueCarouselPosition(total) {
    const track = document.getElementById('leagueGridTrack');
    if (!track) return;
    const allCards = track.querySelectorAll('.league-card');
    if (!allCards.length) return;
    const middleIdx = clamp(_leagueCarouselIdx + Math.floor(5/2), 0, total - 1);
    allCards.forEach((card, i) => card.classList.toggle('league-card-active', i === middleIdx));

    const container = document.getElementById('leagueSelectorInner');
    const activeLeague = null; // brak koloru jak drużyny
    if (container) {
        container.style.background = `
            radial-gradient(ellipse 60% 30% at 20% 0%, rgba(168,85,247,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 60% 30% at 80% 0%, rgba(6,182,212,0.08) 0%, transparent 60%),
            linear-gradient(180deg, #050810 0%, #080c1a 100%)`;
    }
    const cardW = allCards[0].offsetWidth || 260;
    const step = cardW + 24;
    const viewW = track.parentElement?.offsetWidth || 1200;
    const offset = (viewW / 2) - (cardW / 2) - (middleIdx * step);
    track.style.transform = `translateX(${offset}px)`;

    const leftBtn = document.getElementById('leagueCarouselLeft');
    const rightBtn = document.getElementById('leagueCarouselRight');
    if (leftBtn) leftBtn.disabled = middleIdx <= 0;
    if (rightBtn) rightBtn.disabled = middleIdx >= total - 1;
    setTimeout(() => { _leagueScrolling = false; }, CAROUSEL_SCROLL_MS);
}

function scrollLeagueCarousel(dir) {
    if (_leagueScrolling) return;
    _leagueScrolling = true;
    _leagueCarouselIdx += dir;
    const groups = getCountryGroups();
    const entry = groups.find(([c]) => c === state.selectedCountry);
    const total = entry ? entry[1].length : 0;
    _updateLeagueCarouselPosition(total);
}

// Stary renderLeagueSelector potrzebny do inicjalizacji danych (nie renderuje już UI)
function renderLeagueSelector() {
    // dane są gotowe, nic nie renderujemy — użytkownik klika przycisk
}

// Stare funkcje zachowane dla kompatybilności
function renderCountryBar() {}
function renderLeagueGrid() {}
function selectCountry(country) { openLeagueSelect(country); }
function shiftCountry() {}

async function selectLeague(code) {
    state.selectedLeagueCode = code;
    state.pendingLeagueData = deepClone(await loadLeague(code));
    state.teamCarouselStart = 0;
    document.getElementById("leagueSelectorScreen").style.display = "none";
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
    document.getElementById("leagueSelectorScreen").style.display = "block";
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
        const resp = await fetch("./career.html");
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
