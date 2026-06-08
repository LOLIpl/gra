// === UEFA Mechanics ===
// Zaktualizowane do formatu sezonu 2024/2025
// Zaleznosci: state, getClub, escapeHtml, clubCrestHtml, pushForm,
//   toIsoDate, fromIsoDate, shuffle, rand, apiGet, addNews

const FORM_ICON = {W:'<span style="color:#10b981;font-weight:800;">W</span>',D:'<span style="color:#9ca3af;font-weight:800;">R</span>',L:'<span style="color:#ef4444;font-weight:800;">P</span>'};
const UEFA_CUPS = {
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
        if(active) status = '🔥 Aktualnie grasz w ' + c.name + '! Twoja drużyna walczy o trofeum.';
        else if(entry && entry.short !== c.short) status = 'Nie kwalifikujesz się. Obecnie grasz w ' + entry.name + '.';
        return '<div class="uefa-cup-card ' + c.className + '" style="' + (active?'box-shadow:0 0 0 2px ' + c.color + '88, 0 8px 32px ' + c.color + '22;transform:translateY(-2px);':'') + '"><div class="uefa-cup-kicker">' + escapeHtml(c.short) + ' · UEFA</div><div class="uefa-cup-name">' + escapeHtml(c.name) + '</div><div class="uefa-cup-meta">' + status + '</div><div class="uefa-cup-trophy"></div>' + (active?'<div style="position:absolute;top:.8rem;right:.8rem;background:' + c.color + ';color:#fff;font-size:.65rem;font-weight:800;padding:.3rem .7rem;border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,.3);">GRASZ TERAZ</div>':'') + '</div>';
    }).join("");
}

function renderEuropeanTables(){
    const el = document.getElementById("europeanTables");
    if(!el) return;
    if(!state.europeanEntry){
        el.innerHTML = '<div class="card" style="text-align:center;padding:3rem 2rem;color:var(--muted);"><div style="font-size:3rem;margin-bottom:1rem;">🏆</div><h2 style="color:#fff;margin-bottom:.5rem;">Brak kwalifikacji europejskiej</h2><p style="max-width:400px;margin:0 auto;line-height:1.6;">Zajmij odpowiednie miejsce w lidze, aby zakwalifikować się do Ligi Mistrzów, Ligi Europy lub Ligi Konferencji.</p></div>';
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
        html += '<div class="euro-table-card" style="margin-bottom:1rem;border:1px solid #8b5cf633;"><div style="display:flex;align-items:center;gap:.75rem;padding:.8rem 1.1rem;border-bottom:1px solid var(--border);background:rgba(0,0,0,.2);"><div style="width:30px;height:30px;border-radius:50%;background:#8b5cf6;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:.7rem;">1/4</div><div><div style="font-size:.95rem;font-weight:800;color:#fff;">Ćwierćfinał</div><div style="font-size:.72rem;color:var(--muted);">2 mecze</div></div></div><div style="padding:.8rem 1rem;">';
        ko.qf.forEach((t,i) => { if(t.home) html += _renderTie(t, 'Ćwierćfinał ' + (i+1)); });
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
        html += '<div class="euro-table-card" style="margin-bottom:1rem;border:2px solid #fbbf2444;background:linear-gradient(135deg,rgba(251,191,36,.05),rgba(0,0,0,.2));"><div style="text-align:center;padding:1rem;"><div style="font-size:2rem;margin-bottom:.3rem;">🏆</div><div style="font-size:1.1rem;font-weight:900;color:#fbbf24;letter-spacing:.05em;">FINAŁ</div></div><div style="display:flex;align-items:center;justify-content:center;gap:1.5rem;padding:1rem 1.5rem;"><div style="text-align:center;' + (String(ko.final.winner)===String(fh)?'color:#10b981;':'color:#fff;') + '"><div style="width:60px;height:60px;border-radius:50%;background:' + knockoutTeamColor(fh, leagueData) + ';margin:0 auto .4rem;background-image:url('' + fhLogo + '');background-size:76%;background-repeat:no-repeat;background-position:center;"></div><div style="font-size:.85rem;font-weight:800;max-width:120px;">' + escapeHtml(fhName) + '</div></div><div style="text-align:center;"><div style="font-size:2rem;font-weight:900;color:#fbbf24;">' + (finalDone?ko.final.homeGoals + ' : ' + ko.final.awayGoals:'VS') + '</div>' + (finalDone?'<div style="font-size:.75rem;font-weight:700;color:#10b981;margin-top:.3rem;">🏆 ' + escapeHtml(knockoutTeamName(ko.final.winner, leagueData)) + '</div>':'') + '</div><div style="text-align:center;' + (String(ko.final.winner)===String(fa)?'color:#10b981;':'color:#fff;') + '"><div style="width:60px;height:60px;border-radius:50%;background:' + knockoutTeamColor(fa, leagueData) + ';margin:0 auto .4rem;background-image:url('' + faLogo + '');background-size:76%;background-repeat:no-repeat;background-position:center;"></div><div style="font-size:.85rem;font-weight:800;max-width:120px;">' + escapeHtml(faName) + '</div></div></div></div>';
    }
    return html;
}

function _renderSwissTable(tbl, cup, cupCode, leagueData){
    const totalTeams = tbl.length || 36;
    let html = '<div class="euro-table-card" style="margin-bottom:1.25rem;border:1px solid ' + cup.color + '33;"><div style="display:flex;align-items:center;gap:.75rem;padding:.9rem 1.2rem;border-bottom:1px solid var(--border);background:rgba(0,0,0,.2);"><div style="width:36px;height:36px;border-radius:50%;background:' + cup.color + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:.8rem;">' + cup.short + '</div><div><div style="font-size:1.1rem;font-weight:800;color:#fff;">' + cup.name + ' — Faza Ligowa</div><div style="font-size:.78rem;color:var(--muted);">' + totalTeams + ' druzyn · ' + cup.matches + ' kolejek</div></div></div><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:.82rem;"><thead><tr style="background:rgba(0,0,0,.25);"><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">#</th><th style="padding:.6rem .4rem;text-align:left;color:var(--muted);font-size:.65rem;">Drużyna</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">M</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">W</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">R</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">P</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">B+</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">B-</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">RB</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">Pkt</th><th style="padding:.6rem .4rem;text-align:center;color:var(--muted);font-size:.65rem;">Forma</th></tr></thead><tbody>';
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

function buildEuropeanTable(cupCode){
    if(cupCode === 'UCL') return buildUclLeagueTable();
    if(cupCode === 'UEL') return buildUelLeagueTable();
    if(cupCode === 'UECL') return buildUeclLeagueTable();
    return [];
}

function getEuropeanQualification(){
    const code = state.selectedLeagueCode;
    const tier = getLeagueTier();
    if(tier.tier > 1) return null;
    const uefa = getUefaForLeague(code);
    if(!uefa) return null;
    const pos = state.table.findIndex(r => r.clubId === state.team.club_id);
    if(pos < 0) return null;
    let end = 0;
    if(pos < (end += (uefa.ucl_spots||0))) return {name:'Liga Mistrzow', short:'LM', color:'#1a47b8'};
    if(pos < (end += (uefa.uel_spots||0))) return {name:'Liga Europy', short:'LE', color:'#ea580c'};
    if(pos < (end += (uefa.uecl_spots||0))) return {name:'Liga Konferencji', short:'LK', color:'#16a34a'};
    return null;
}
