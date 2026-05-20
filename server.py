import json
import random
import re
import sys
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
import league_tiers


ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "transfermarkt_players.json"
SAVE_PATH = ROOT / "career_state.json"
RATING_PATH = ROOT / "oceny.json"
ADMIN_DATA_PATH = ROOT / "admin_data.json"
UEFA_PATH = ROOT / "uefa.json"
HOST = "0.0.0.0"
PORT = 8000

CACHED_BOOTSTRAP_BYTES = None
CACHED_TRANSFERS_BYTES = None
CACHED_LEAGUES_BYTES = None


def load_rating_config() -> dict:
    default = {
        "min_ovr": 38,
        "max_ovr": 95,
        "value_percentile_min": 38,
        "value_percentile_max": 85,
        "experience_max_bonus": 7,
        "potential_max_bonus": 10,
        "overrides": {},
    }
    if not RATING_PATH.exists():
        return default
    try:
        data = json.loads(RATING_PATH.read_text(encoding="utf-8"))
        return {**default, **data}
    except (json.JSONDecodeError, OSError):
        return default


RATING_CFG = load_rating_config()


def load_raw_data() -> dict:
    with open(DATA_PATH, "rb") as f:
        return json.load(f)


def extract_age(date_of_birth: str) -> int | None:
    match = re.search(r"\((\d+)\)", date_of_birth or "")
    return int(match.group(1)) if match else None


def bucket_position(position: str) -> str:
    lowered = (position or "").lower()
    if "bramkarz" in lowered:
        return "BR"
    if "obro" in lowered:
        return "OB"
    if "pomoc" in lowered:
        return "PO"
    return "NA"


def color_from_club_id(club_id: str) -> str:
    seed = sum(ord(char) for char in str(club_id))
    hue = seed % 360
    return f"hsl({hue} 70% 48%)"


def league_logo_url(competition_code: str) -> str:
    code = str(competition_code).lower()
    return f"https://tmssl.akamaized.net//images/logo/homepageWappen150x150/{code}.png"


def upscale_club_logo_url(url: str, club_id: str) -> str:
    cleaned = str(url or "").strip()
    if not cleaned and club_id:
        return f"https://tmssl.akamaized.net//images/wappen/head/{club_id}.png"
    if "/images/wappen/tiny/" in cleaned:
        return cleaned.replace("/images/wappen/tiny/", "/images/wappen/head/")
    if "/images/wappen/kaderquad/" in cleaned:
        return cleaned.replace("/images/wappen/kaderquad/", "/images/wappen/head/")
    return cleaned


# Domyślna mapa lig: tier (siła finansowa) i poziom (szczebel rozgrywek)
DEFAULT_LEAGUE_META = {
    "GB1":{"tier":1,"level":1,"label":"Premier League"},
    "ES1":{"tier":1,"level":1,"label":"La Liga"},
    "IT1":{"tier":1,"level":1,"label":"Serie A"},
    "DE1":{"tier":1,"level":1,"label":"Bundesliga"},
    "FR1":{"tier":1,"level":1,"label":"Ligue 1"},
    "PO1":{"tier":2,"level":1,"label":"Primeira Liga"},
    "NL1":{"tier":2,"level":1,"label":"Eredivisie"},
    "RU1":{"tier":2,"level":1,"label":"Premier Liga RU"},
    "TR1":{"tier":2,"level":1,"label":"Süper Lig"},
    "BE1":{"tier":2,"level":1,"label":"Jupiler Pro"},
    "A1": {"tier":3,"level":1,"label":"Bundesliga AT"},
    "C1": {"tier":3,"level":1,"label":"HNL"},
    "L1": {"tier":3,"level":1,"label":"Pro League"},
    "NO1":{"tier":3,"level":1,"label":"Eliteserien"},
    "PL1":{"tier":3,"level":1,"label":"Ekstraklasa"},
    "SC1":{"tier":3,"level":1,"label":"Scottish Premiership"},
    "GR1":{"tier":3,"level":1,"label":"Super League"},
    "DK1":{"tier":3,"level":1,"label":"Superliga DK"},
    "SER1":{"tier":3,"level":1,"label":"SuperLiga SRB"},
    "TS1":{"tier":3,"level":1,"label":"Chance Liga"},
    "UKR1":{"tier":3,"level":1,"label":"Premier Liha"},
    "POWM":{"tier":4,"level":2,"label":"Puchar Polski"},
}

def load_admin_data() -> dict:
    default = {
        "league_meta": {},       "extra_leagues": {},
        "extra_clubs": {},       "deleted_leagues": [], "deleted_clubs": [],
    }
    if not ADMIN_DATA_PATH.exists():
        return default
    try:
        data = json.loads(ADMIN_DATA_PATH.read_text(encoding="utf-8"))
        return {**default, **data}
    except (json.JSONDecodeError, OSError):
        return default

def save_admin_data(data: dict) -> None:
    ADMIN_DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

ADMIN_DATA = load_admin_data()

def get_league_meta(code: str) -> dict:
    code = code.upper()
    override = ADMIN_DATA.get("league_meta", {}).get(code, {})
    default = DEFAULT_LEAGUE_META.get(code, {"tier":4,"level":1,"label":code})
    return {**default, **override}

def build_database(raw_data: dict) -> dict:
    players = raw_data.get("players", [])
    market_values = sorted(
        player.get("market_value_eur") or 0 for player in players if player.get("market_value_eur")
    )
    max_index = max(1, len(market_values) - 1)

    def rating_from_value(value: int | None) -> int:
        if not value or not market_values:
            return 35
        index = 0
        lo = 0
        hi = len(market_values) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if market_values[mid] <= value:
                index = mid
                lo = mid + 1
            else:
                hi = mid - 1
        percentile = index / max_index
        cfg = RATING_CFG
        base = round(cfg["value_percentile_min"] + percentile * (cfg["value_percentile_max"] - cfg["value_percentile_min"]))
        return max(cfg["min_ovr"], min(cfg["max_ovr"], base))

    def compute_rating_details(mv_eur: int | None, age: int | None, pname: str) -> dict:
        cfg = RATING_CFG
        base_rating = rating_from_value(mv_eur)
        exp_bonus = 0
        pot_bonus = 0
        if age is not None:
            exp_years = min(max(age - 18, 0), 18)
            exp_bonus = round(exp_years * (cfg["experience_max_bonus"] / 18))
            if age <= 23 and mv_eur and mv_eur > 500_000:
                pot_bonus = min(cfg["potential_max_bonus"], round(mv_eur / 8_000_000) + 1)
            pot_bonus = min(pot_bonus, cfg["potential_max_bonus"])
        after_exp = base_rating + exp_bonus
        total = max(cfg["min_ovr"], min(cfg["max_ovr"], after_exp + pot_bonus))
        override = cfg.get("overrides", {}).get(pname)
        if override:
            total = override.get("rating", total)
        return {"rating": total, "rating_base": base_rating, "rating_experience": exp_bonus, "rating_potential": pot_bonus, "potential": pot_bonus}

    players_by_club: dict[str, list] = {}
    for player in players:
        club = player.get("club", {})
        if isinstance(club, (str, int, float)):
            club_id = str(club).strip()
        else:
            club_id = str(club.get("club_id", "")).strip() if isinstance(club, dict) else ""
        if not club_id:
            continue

        age = extract_age(player.get("date_of_birth", ""))
        rd = compute_rating_details(player.get("market_value_eur"), age, player.get("name", ""))

        normalized_player = {
            "player_id": str(player.get("player_id", "")),
            "name": player.get("name", ""),
            "position": bucket_position(player.get("position", "")),
            "position_label": player.get("position", ""),
            "age": age,
            "date_of_birth": player.get("date_of_birth", ""),
            "market_value": player.get("market_value", ""),
            "market_value_eur": player.get("market_value_eur"),
            "rating": rd["rating"],
            "rating_base": rd["rating_base"],
            "rating_experience": rd["rating_experience"],
            "rating_potential": rd["rating_potential"],
            "potential": rd["potential"],
            "photo_url": player.get("photo_url", ""),
            "nationalities": player.get("nationalities", []),
            "club_id": club_id,
        }
        players_by_club.setdefault(club_id, []).append(normalized_player)

    league_payloads: dict[str, dict] = {}
    transfer_candidates: list[dict] = []
    for league in raw_data.get("leagues", []):
        competition_code = str(league.get("competition_code", "")).upper()
        clubs_payload = []

        for club in league.get("clubs", []):
            club_id = str(club.get("club_id", ""))
            roster = sorted(
                players_by_club.get(club_id, []),
                key=lambda item: (
                    -(item.get("rating") or 0),
                    -(item.get("market_value_eur") or 0),
                    item.get("name", ""),
                ),
            )
            top_eleven = roster[:11]
            avg_rating = round(
                sum(player.get("rating") or 0 for player in top_eleven) / max(1, len(top_eleven))
            )
            squad_value = sum(player.get("market_value_eur") or 0 for player in roster)
            budget_millions = round(max(0.5, squad_value * 0.17 / 1_000_000), 2)
            logo_url = upscale_club_logo_url(club.get("logo_url", ""), club_id)

            clubs_payload.append(
                {
                    "club_id": club_id,
                    "name": club.get("name", ""),
                    "url": club.get("url", ""),
                    "logo_url": logo_url,
                    "league_url": club.get("league_url", ""),
                    "color": color_from_club_id(club_id),
                    "avg_rating": avg_rating,
                    "strength": avg_rating,
                    "budget_millions": budget_millions,
                    "squad_size": len(roster),
                    "players": roster,
                }
            )

            for player in roster:
                transfer_candidates.append(
                    {
                        **player,
                        "club_name": club.get("name", ""),
                        "club_id": club_id,
                        "club_logo_url": logo_url,
                        "club_color": color_from_club_id(club_id),
                        "league_name": league.get("name", ""),
                        "competition_code": competition_code,
                    }
                )

        clubs_payload.sort(key=lambda club: (-club["avg_rating"], club["name"]))
        league_payloads[competition_code] = {
            "competition_code": competition_code,
            "name": league.get("name", ""),
            "url": league.get("url", ""),
            "club_count": len(clubs_payload),
            "league_logo_url": league_logo_url(competition_code),
            "clubs": clubs_payload,
        }

    bootstrap = {
        "generated_from": raw_data.get("scraped_at_utc"),
        "league_count": len(league_payloads),
        "leagues": sorted(
            [
                {
                    "competition_code": league["competition_code"],
                    "name": league["name"],
                    "club_count": league["club_count"],
                    "league_logo_url": league["league_logo_url"],
                }
                for league in league_payloads.values()
            ],
            key=lambda league: (-league["club_count"], league["name"]),
        ),
    }

    transfer_candidates.sort(
        key=lambda player: (
            -(player.get("rating") or 0),
            -(player.get("market_value_eur") or 0),
            player.get("name", ""),
        )
    )

    return {
        "bootstrap": bootstrap,
        "leagues": league_payloads,
        "transfers": transfer_candidates,
    }


def load_saved_state() -> dict | None:
    if not SAVE_PATH.exists():
        return None
    return json.loads(SAVE_PATH.read_text(encoding="utf-8"))


def save_state(payload: dict) -> None:
    SAVE_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def load_uefa_data(raw) -> dict | None:
    if not UEFA_PATH.exists():
        return None
    try:
        data = json.loads(UEFA_PATH.read_text(encoding="utf-8"))
        rankings = data.get("rankings", [])

        league_names = {}
        for league in raw.get("leagues", []):
            code = league.get("competition_code", "")
            name = league.get("name", "")
            if code:
                league_names[code] = name

        filtered = []
        for r in rankings:
            code = r.get("competition_code", "")
            if not league_tiers.is_first_division(code):
                continue
            if code in league_names:
                r["league_name"] = league_names[code]
            filtered.append(r)
        data["rankings"] = filtered
        return data
    except (json.JSONDecodeError, OSError):
        return None

RAW_DATA = load_raw_data()
UEFA_DATA = load_uefa_data(RAW_DATA)
import sys as _sys
_sys.stderr.write(f"[DEBUG] RAW_DATA players={len(RAW_DATA.get('players', []))} leagues={len(RAW_DATA.get('leagues', []))}\n")
_sys.stderr.flush()
DATABASE = build_database(RAW_DATA)
_sys.stderr.write(f"[DEBUG] DB leagues={len(DATABASE['leagues'])} transfers={len(DATABASE['transfers'])}\n")
_sys.stderr.flush()

# Kopia oryginalnych danych dla resetu w adminie
ORIGINAL_DATABASE = json.loads(json.dumps(DATABASE))



def get_bootstrap_bytes():
    global CACHED_BOOTSTRAP_BYTES
    if CACHED_BOOTSTRAP_BYTES is None:
        CACHED_BOOTSTRAP_BYTES = json.dumps(DATABASE["bootstrap"]).encode("utf-8")
    return CACHED_BOOTSTRAP_BYTES

def get_transfers_bytes():
    global CACHED_TRANSFERS_BYTES
    if CACHED_TRANSFERS_BYTES is None:
        import sys as _sys
        _sys.stderr.write(f"[CACHE] transfers count in DATABASE: {len(DATABASE['transfers'])}\n")
        _sys.stderr.write(f"[CACHE] DATABASE id: {id(DATABASE)}\n")
        _sys.stderr.flush()
        try:
            serialized = json.dumps({"players": DATABASE["transfers"]})
        except Exception as e:
            serialized = json.dumps({"players": [], "error": str(e)})
            _sys.stderr.write(f"[CACHE] json.dumps ERROR: {e}\n")
            _sys.stderr.flush()
        _sys.stderr.write(f"[CACHE] serialized length: {len(serialized)}\n")
        _sys.stderr.flush()
        CACHED_TRANSFERS_BYTES = serialized.encode("utf-8")
        _sys.stderr.write(f"[CACHE] bytes length: {len(CACHED_TRANSFERS_BYTES)}\n")
        _sys.stderr.write(f"[CACHE] first 50 bytes: {CACHED_TRANSFERS_BYTES[:50]}\n")
        _sys.stderr.flush()
    return CACHED_TRANSFERS_BYTES

def get_leagues_bytes():
    global CACHED_LEAGUES_BYTES
    if CACHED_LEAGUES_BYTES is not None:
        return CACHED_LEAGUES_BYTES
    leagues_data = {code: {
        "name": data["name"],
        "logo_url": league_logo_url(code),
        "clubs": [{
            "club_id": c["club_id"], "name": c["name"],
            "avg_rating": c["avg_rating"], "budget_millions": c["budget_millions"],
            "squad_size": c["squad_size"], "color": c["color"],
            "logo_url": c["logo_url"], "players": c["players"],
        } for c in data["clubs"]],
    } for code, data in DATABASE["leagues"].items()}
    CACHED_LEAGUES_BYTES = json.dumps(leagues_data).encode("utf-8")
    return CACHED_LEAGUES_BYTES


# === ADMIN HELPERS ===

def admin_player_from_raw(raw: dict) -> dict:
    age = extract_age(raw.get("date_of_birth", ""))
    pos = bucket_position(raw.get("position", ""))
    mv = raw.get("market_value_eur") or 0
    return {
        "player_id": str(raw.get("player_id", "")),
        "name": raw.get("name", ""),
        "position": pos,
        "age": age,
        "market_value": raw.get("market_value", ""),
        "market_value_eur": mv,
        "rating": 0, "rating_base": 0, "rating_experience": 0, "rating_potential": 0,
    }

def build_admin_leagues() -> dict:
    leagues_list = []
    # Istniejące ligi z bazy (pomijając usunięte)
    for code, data in DATABASE["leagues"].items():
        if code.upper() in ADMIN_DATA.get("deleted_leagues", []):
            continue
        meta = get_league_meta(code)
        clubs = data.get("clubs", [])
        total_players = sum(c.get("squad_size", 0) for c in clubs)
        avg_budget = round(sum(c.get("budget_millions", 0) for c in clubs) / max(1, len(clubs)), 1)
        leagues_list.append({
            "code": code,
            "name": data.get("name", ""),
            "tier": meta["tier"],
            "level": meta["level"],
            "label": meta["label"],
            "club_count": len(clubs),
            "total_players": total_players,
            "avg_budget": avg_budget,
            "is_extra": False,
        })
    # Dodatkowe ligi od admina
    for code, extra in ADMIN_DATA.get("extra_leagues", {}).items():
        meta = get_league_meta(code)
        leagues_list.append({
            "code": code,
            "name": extra.get("name", code),
            "tier": meta["tier"],
            "level": meta["level"],
            "label": meta["label"],
            "club_count": len(extra.get("club_ids", [])),
            "total_players": 0,
            "avg_budget": 0,
            "is_extra": True,
        })
    leagues_list.sort(key=lambda l: (l["tier"], l["level"], -l["club_count"]))
    return {"leagues": leagues_list}

def build_admin_league(code: str) -> dict | None:
    code = code.upper()
    is_extra = False
    # Sprawdź czy to extra liga
    extra = ADMIN_DATA.get("extra_leagues", {}).get(code)
    if extra:
        is_extra = True
        clubs_data = []
        for cid in extra.get("club_ids", []):
            cdata = ADMIN_DATA.get("extra_clubs", {}).get(cid)
            if cdata:
                clubs_data.append({
                    "club_id": cid,
                    "name": cdata.get("name", ""),
                    "avg_rating": cdata.get("avg_rating", 50),
                    "budget_millions": cdata.get("budget_millions", 0.5),
                    "squad_size": cdata.get("squad_size", 0),
                    "color": cdata.get("color", "#3b82f6"),
                    "logo_url": cdata.get("logo_url", ""),
                })
        meta = get_league_meta(code)
        return {
            "code": code,
            "name": extra.get("name", code),
            "tier": meta["tier"],
            "level": meta["level"],
            "label": meta["label"],
            "club_count": len(clubs_data),
            "total_players": 0,
            "is_extra": True,
            "clubs": clubs_data,
        }
    # Istniejąca liga z bazy
    data = DATABASE["leagues"].get(code)
    if not data:
        return None
    if code in ADMIN_DATA.get("deleted_leagues", []):
        return None
    meta = get_league_meta(code)
    clubs = data.get("clubs", [])
    # Filtruj usunięte kluby
    deleted = set(ADMIN_DATA.get("deleted_clubs", []))
    clubs = [c for c in clubs if c.get("club_id") not in deleted]
    total_players = sum(c.get("squad_size", 0) for c in clubs)
    return {
        "code": code,
        "name": data.get("name", ""),
        "tier": meta["tier"],
        "level": meta["level"],
        "label": meta["label"],
        "club_count": len(clubs),
        "total_players": total_players,
        "is_extra": False,
        "clubs": [{
            "club_id": c.get("club_id"),
            "name": c.get("name"),
            "avg_rating": c.get("avg_rating"),
            "budget_millions": c.get("budget_millions"),
            "squad_size": c.get("squad_size"),
            "color": c.get("color"),
            "logo_url": c.get("logo_url"),
        } for c in clubs],
    }

def build_admin_club(club_id: str) -> dict | None:
    for league_data in DATABASE["leagues"].values():
        for club in league_data.get("clubs", []):
            if club.get("club_id") == club_id:
                return {
                    "club_id": club.get("club_id"),
                    "name": club.get("name"),
                    "color": club.get("color"),
                    "avg_rating": club.get("avg_rating"),
                    "budget_millions": club.get("budget_millions"),
                    "squad_size": club.get("squad_size"),
                    "players": club.get("players", []),
                }
    return None

def find_player_in_db(pid: str) -> dict | None:
    for league_data in DATABASE["leagues"].values():
        for club in league_data.get("clubs", []):
            for player in club.get("players", []):
                if str(player.get("player_id")) == str(pid):
                    return player
    return None

def find_original_player(pid: str) -> dict | None:
    for league_data in ORIGINAL_DATABASE["leagues"].values():
        for club in league_data.get("clubs", []):
            for player in club.get("players", []):
                if str(player.get("player_id")) == str(pid):
                    return player
    return None

def update_player_rating(pid: str, fields: dict) -> dict | None:
    player = find_player_in_db(pid)
    if not player:
        return None
    for key in ("rating", "rating_base", "rating_experience", "rating_potential", "potential"):
        if key in fields:
            player[key] = max(0, min(99, int(fields[key])))
    return {"ok": True, **{k: player.get(k) for k in ("rating","rating_base","rating_experience","rating_potential")}}

def reset_player_rating(pid: str) -> dict:
    player = find_player_in_db(pid)
    original = find_original_player(pid)
    if player and original:
        for key in ("rating", "rating_base", "rating_experience", "rating_potential", "potential"):
            player[key] = original[key]
        return {"ok": True, **{k: player.get(k) for k in ("rating","rating_base","rating_experience","rating_potential")}}
    if player:
        return {"ok": True, **{k: player.get(k) for k in ("rating","rating_base","rating_experience","rating_potential")}}
    return {"ok": False}

def build_rating_stats() -> dict:
    all_ratings = []
    total_players = 0
    for league_data in DATABASE["leagues"].values():
        for club in league_data.get("clubs", []):
            total_players += len(club.get("players", []))
            for p in club.get("players", []):
                r = p.get("rating") or 0
                all_ratings.append(r)
    if not all_ratings:
        return {"total_players": 0, "avg_rating": 0, "min_rating": 0, "max_rating": 0, "range_under_40": 0, "range_40_60": 0, "range_60_80": 0}
    avg = round(sum(all_ratings) / len(all_ratings))
    under_40 = sum(1 for r in all_ratings if r < 40)
    mid = sum(1 for r in all_ratings if 40 <= r < 60)
    over_60 = sum(1 for r in all_ratings if r >= 60)
    return {
        "total_players": total_players,
        "avg_rating": avg,
        "min_rating": min(all_ratings),
        "max_rating": max(all_ratings),
        "range_under_40": under_40,
        "range_40_60": mid,
        "range_60_80": over_60,
    }

def save_rating_config(config: dict) -> None:
    global RATING_CFG, DATABASE, ORIGINAL_DATABASE
    allowed = {"min_ovr","max_ovr","value_percentile_min","value_percentile_max","experience_max_bonus","potential_max_bonus","overrides"}
    for key in allowed:
        if key in config:
            RATING_CFG[key] = config[key]
    with open(RATING_PATH, "w", encoding="utf-8") as f:
        json.dump(RATING_CFG, f, ensure_ascii=False, indent=2)

def rebuild_database() -> dict:
    global DATABASE, ORIGINAL_DATABASE, CACHED_BOOTSTRAP_BYTES, CACHED_TRANSFERS_BYTES, CACHED_LEAGUES_BYTES
    CACHED_BOOTSTRAP_BYTES = None
    CACHED_TRANSFERS_BYTES = None
    CACHED_LEAGUES_BYTES = None
    DATABASE = build_database(RAW_DATA)
    ORIGINAL_DATABASE = json.loads(json.dumps(DATABASE))
    stats = build_rating_stats()
    return {"ok": True, "total_players": stats["total_players"], "avg_rating": stats["avg_rating"]}

def bulk_subtract(body: dict) -> dict:
    val = int(body.get("value", 3))
    position = body.get("position", "")
    league = body.get("league", "")
    updated = 0
    for code, league_data in DATABASE["leagues"].items():
        if league and code.upper() != league.upper():
            continue
        for club in league_data.get("clubs", []):
            for player in club.get("players", []):
                if position and player.get("position") != position:
                    continue
                r = player.get("rating") or 0
                new_r = max(25, min(80, r - val))
                if new_r != r:
                    player["rating"] = new_r
                    updated += 1
    return {"updated": updated}

def bulk_set(body: dict) -> dict:
    val = int(body.get("value", 50))
    position = body.get("position", "")
    updated = 0
    for league_data in DATABASE["leagues"].values():
        for club in league_data.get("clubs", []):
            for player in club.get("players", []):
                if position and player.get("position") != position:
                    continue
                player["rating"] = max(25, min(80, val))
                updated += 1
    return {"updated": updated}

def bulk_percent(body: dict) -> dict:
    pct = int(body.get("percent", -20))
    updated = 0
    for league_data in DATABASE["leagues"].values():
        for club in league_data.get("clubs", []):
            for player in club.get("players", []):
                r = player.get("rating") or 0
                new_r = max(25, min(80, round(r + r * pct / 100)))
                if new_r != r:
                    player["rating"] = new_r
                    updated += 1
    return {"updated": updated}


# === ADMIN CRUD HELPERS ===

def admin_upsert_league(code: str, body: dict) -> dict:
    code = code.upper()
    meta = ADMIN_DATA.get("league_meta", {}).get(code, {})
    if "tier" in body:
        meta["tier"] = max(1, min(4, int(body["tier"])))
    if "level" in body:
        meta["level"] = max(1, int(body["level"]))
    if "label" in body:
        meta["label"] = str(body["label"])
    if "name" in body:
        # Dla extra lig zapisz nazwę
        if code not in ADMIN_DATA.get("extra_leagues", {}):
            if "extra_leagues" not in ADMIN_DATA:
                ADMIN_DATA["extra_leagues"] = {}
            ADMIN_DATA["extra_leagues"].setdefault(code, {})

    ADMIN_DATA.setdefault("league_meta", {})[code] = meta
    save_admin_data(ADMIN_DATA)
    return {"ok": True, "code": code, **meta}

def admin_delete_league(code: str) -> dict:
    code = code.upper()
    ADMIN_DATA.setdefault("deleted_leagues", [])
    if code not in ADMIN_DATA["deleted_leagues"]:
        ADMIN_DATA["deleted_leagues"].append(code)
    ADMIN_DATA.get("league_meta", {}).pop(code, None)
    ADMIN_DATA.get("extra_leagues", {}).pop(code, None)
    save_admin_data(ADMIN_DATA)
    return {"ok": True, "deleted": code}

def admin_add_league(body: dict) -> dict:
    code = body.get("code", "").upper()
    if not code:
        return {"error": "Code required"}
    name = body.get("name", code)
    tier = max(1, min(4, int(body.get("tier", 4))))
    level = max(1, int(body.get("level", 1)))
    label = body.get("label", name)
    ADMIN_DATA.setdefault("extra_leagues", {})
    ADMIN_DATA.setdefault("league_meta", {})
    ADMIN_DATA["extra_leagues"][code] = {"name": name, "club_ids": []}
    ADMIN_DATA["league_meta"][code] = {"tier": tier, "level": level, "label": label}
    # Usuń z listy usuniętych jeśli była
    if code in ADMIN_DATA.get("deleted_leagues", []):
        ADMIN_DATA["deleted_leagues"].remove(code)
    save_admin_data(ADMIN_DATA)
    return {"ok": True, "code": code, "tier": tier, "level": level}

def admin_add_club(body: dict) -> dict:
    league_code = body.get("league_code", "").upper()
    club_id = body.get("club_id", "") or f"admin_{abs(hash(str(body.get('name','')))) % 10**8}"
    name = body.get("name", "Nowy Klub")
    color = body.get("color", "#3b82f6")
    # Dodaj do extra ligi
    ADMIN_DATA.setdefault("extra_clubs", {})
    ADMIN_DATA.setdefault("extra_leagues", {})
    if league_code in ADMIN_DATA["extra_leagues"]:
        ADMIN_DATA["extra_clubs"][club_id] = {
            "name": name,
            "color": color,
            "avg_rating": 50,
            "budget_millions": 0.5,
            "squad_size": 0,
            "logo_url": body.get("logo_url", ""),
        }
        if club_id not in ADMIN_DATA["extra_leagues"][league_code].get("club_ids", []):
            ADMIN_DATA["extra_leagues"][league_code].setdefault("club_ids", []).append(club_id)
    else:
        # Dodaj do istniejącej ligi z bazy – dodajemy jako extra klub
        ADMIN_DATA["extra_clubs"][club_id] = {
            "name": name,
            "color": color,
            "avg_rating": 50,
            "budget_millions": 0.5,
            "squad_size": 0,
            "logo_url": body.get("logo_url", ""),
        }
    save_admin_data(ADMIN_DATA)
    return {"ok": True, "club_id": club_id, "name": name}

def admin_delete_club(club_id: str) -> dict:
    club_id = str(club_id)
    ADMIN_DATA.setdefault("deleted_clubs", [])
    if club_id not in ADMIN_DATA["deleted_clubs"]:
        ADMIN_DATA["deleted_clubs"].append(club_id)
    # Usuń też z extra_clubs jeśli istnieje
    ADMIN_DATA.get("extra_clubs", {}).pop(club_id, None)
    # Usuń z extra lig
    for league_data in ADMIN_DATA.get("extra_leagues", {}).values():
        if club_id in league_data.get("club_ids", []):
            league_data["club_ids"].remove(club_id)
    save_admin_data(ADMIN_DATA)
    return {"ok": True, "deleted": club_id}


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_bytes(self, data: bytes, status: HTTPStatus = HTTPStatus.OK) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "max-age=3600")
        self.end_headers()
        self.wfile.write(data)

    def read_json_body(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b"{}"
        return json.loads(raw.decode("utf-8"))

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self.send_json({"ok": True})
            return

        if path == "/api/bootstrap":
            self.send_bytes(get_bootstrap_bytes())
            return

        if path == "/api/transfers":
            self.send_bytes(get_transfers_bytes())
            return

        if path.startswith("/api/league/"):
            competition_code = path.rsplit("/", 1)[-1].upper()
            league_payload = DATABASE["leagues"].get(competition_code)
            if league_payload is None:
                self.send_json(
                    {"error": f"League {competition_code} not found."},
                    status=HTTPStatus.NOT_FOUND,
                )
                return
            self.send_json(league_payload)
            return

        if path == "/api/leagues":
            self.send_bytes(get_leagues_bytes())
            return

        if path == "/api/uefa":
            if UEFA_DATA is None:
                self.send_json({"error": "No UEFA data"}, status=HTTPStatus.NOT_FOUND)
                return
            self.send_json(UEFA_DATA)
            return

        if path == "/api/save-exists":
            payload = load_saved_state()
            self.send_json({"exists": payload is not None})
            return

        if path == "/api/save":
            payload = load_saved_state()
            if payload is None:
                self.send_json({"exists": False})
            else:
                self.send_json({"exists": True, "state": payload})
            return

        if path == "/admin" or path == "/admin.html":
            self.path = "/admin.html"
            super().do_GET()
            return

        if path == "/api/admin/leagues":
            self.send_json(build_admin_leagues())
            return

        if path.startswith("/api/admin/league/"):
            code = path.rsplit("/", 1)[-1].upper()
            payload = build_admin_league(code)
            if payload is None:
                self.send_json({"error": "League not found"}, status=HTTPStatus.NOT_FOUND)
            else:
                self.send_json(payload)
            return

        if path == "/api/admin/all-codes":
            codes = sorted(set(
                list(DATABASE["leagues"].keys())
                + list(ADMIN_DATA.get("extra_leagues", {}).keys())
            ))
            self.send_json({"codes": codes})
            return

        if path.startswith("/api/admin/club/"):
            club_id = path.rsplit("/", 1)[-1]
            payload = build_admin_club(club_id)
            if payload is None:
                self.send_json({"error": "Club not found"}, status=HTTPStatus.NOT_FOUND)
            else:
                self.send_json(payload)
            return

        if path.startswith("/api/admin/player/") and path.endswith("/reset"):
            pid = path.split("/")[-2]
            data = reset_player_rating(pid)
            self.send_json(data)
            return

        if path.startswith("/api/admin/player/"):
            pid = path.rsplit("/", 1)[-1]
            # PUT handled in do_POST
            self.send_json({"error": "Use PUT"}, status=HTTPStatus.METHOD_NOT_ALLOWED)
            return

        if path == "/api/admin/config":
            self.send_json(RATING_CFG)
            return

        if path == "/api/admin/rating-stats":
            self.send_json(build_rating_stats())
            return

        if path == "/api/admin/rebuild":
            # POST handled in do_POST
            self.send_json({"error": "Use POST"}, status=HTTPStatus.METHOD_NOT_ALLOWED)
            return

        if path == "/":
            self.path = "/index.html"

        super().do_GET()

    def do_PUT(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/admin/player/"):
            pid = path.rsplit("/", 1)[-1]
            body = self.read_json_body()
            result = update_player_rating(pid, body)
            if result:
                self.send_json(result)
            else:
                self.send_json({"error": "Player not found"}, status=HTTPStatus.NOT_FOUND)
            return

        if path.startswith("/api/admin/league/"):
            code = path.rsplit("/", 1)[-1].upper()
            body = self.read_json_body()
            result = admin_upsert_league(code, body)
            self.send_json(result)
            return

        if path == "/api/admin/club":
            body = self.read_json_body()
            result = admin_add_club(body)
            self.send_json(result)
            return

        if path == "/api/admin/config":
            body = self.read_json_body()
            save_rating_config(body)
            self.send_json({"ok": True})
            return

        self.send_json({"error": "Unsupported endpoint."}, status=HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/save":
            payload = self.read_json_body()
            save_state(payload)
            self.send_json({"ok": True, "path": str(SAVE_PATH)})
            return

        if path.startswith("/api/admin/player/") and path.endswith("/reset"):
            pid = path.split("/")[-2]
            data = reset_player_rating(pid)
            self.send_json(data)
            return

        if path == "/api/admin/league":
            body = self.read_json_body()
            result = admin_add_league(body)
            self.send_json(result)
            return

        if path == "/api/admin/rebuild":
            result = rebuild_database()
            self.send_json(result)
            return

        if path == "/api/admin/bulk/subtract":
            body = self.read_json_body()
            result = bulk_subtract(body)
            self.send_json(result)
            return

        if path == "/api/admin/bulk/set":
            body = self.read_json_body()
            result = bulk_set(body)
            self.send_json(result)
            return

        if path == "/api/admin/bulk/percent":
            body = self.read_json_body()
            result = bulk_percent(body)
            self.send_json(result)
            return

        self.send_json({"error": "Unsupported endpoint."}, status=HTTPStatus.NOT_FOUND)

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/admin/league/"):
            code = path.rsplit("/", 1)[-1].upper()
            result = admin_delete_league(code)
            self.send_json(result)
            return

        if path.startswith("/api/admin/club/"):
            club_id = path.rsplit("/", 1)[-1]
            result = admin_delete_club(club_id)
            self.send_json(result)
            return

        self.send_json({"error": "Unsupported endpoint."}, status=HTTPStatus.NOT_FOUND)


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f"Server running at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
