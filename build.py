#!/usr/bin/env python3
"""Pre-build static JSON data from server.py database for GitHub Pages."""
import sys
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

DATA_DIR = ROOT / "data"
LEAGUE_DIR = DATA_DIR / "league"

# Import server internals to build the database
from server import RAW_DATA, RATING_CFG, build_database, load_uefa_data  # noqa: E402

database = build_database(RAW_DATA)
uefa_data = load_uefa_data(RAW_DATA)

DATA_DIR.mkdir(parents=True, exist_ok=True)
LEAGUE_DIR.mkdir(parents=True, exist_ok=True)

# 1. bootstap.json — league summary
DATA_DIR.joinpath("bootstrap.json").write_text(
    json.dumps(database["bootstrap"], ensure_ascii=False), encoding="utf-8"
)

# 2. transfers.json — flat player list
DATA_DIR.joinpath("transfers.json").write_text(
    json.dumps({"players": database["transfers"]}, ensure_ascii=False), encoding="utf-8"
)

# 3. leagues.json — stripped league/club/player tree
leagues_out = {}
for code, league in database["leagues"].items():
    clubs_out = []
    for club in league["clubs"]:
        clubs_out.append({
            "club_id": club["club_id"],
            "name": club["name"],
            "avg_rating": club["avg_rating"],
            "budget_millions": club["budget_millions"],
            "squad_size": club["squad_size"],
            "color": club["color"],
            "logo_url": club["logo_url"],
            "players": club["players"],
        })
    leagues_out[code] = {
        "name": league["name"],
        "logo_url": league.get("league_logo_url", ""),
        "clubs": clubs_out,
    }
DATA_DIR.joinpath("leagues.json").write_text(
    json.dumps(leagues_out, ensure_ascii=False), encoding="utf-8"
)

# 4. Individual league files
for code, league in database["leagues"].items():
    LEAGUE_DIR.joinpath(f"{code}.json").write_text(
        json.dumps(league, ensure_ascii=False), encoding="utf-8"
    )

# 5. UEFA data
DATA_DIR.joinpath("uefa.json").write_text(
    json.dumps(uefa_data, ensure_ascii=False), encoding="utf-8"
)

# 6. Rating config (static snapshot)
DATA_DIR.joinpath("config.json").write_text(
    json.dumps(RATING_CFG, ensure_ascii=False), encoding="utf-8"
)

print(f"Static data built: {len(database['bootstrap']['leagues'])} leagues, {sum(len(l['clubs']) for l in database['leagues'].values())} clubs")
