import json
import os

SRC = "transfermarkt_players.json"
DST = "transfermarkt_players.json"

with open(SRC, "rb") as f:
    data = json.load(f)

orig_size = os.path.getsize(SRC)

players = data.get("players", [])
leagues = data.get("leagues", [])

for p in players:
    p.pop("url", None)
    p.pop("league", None)
    nats = p.get("nationalities", [])
    if nats and isinstance(nats[0], dict):
        p["nationalities"] = [n.get("name", "") for n in nats]
    club = p.get("club")
    if isinstance(club, dict):
        cid = club.get("club_id", "")
        p["club"] = cid if cid else ""

for liga in leagues:
    clubs = liga.get("clubs", [])
    for c in clubs:
        c.pop("url", None)
        c.pop("league_url", None)

data.pop("scraped_at_utc", None)
data.pop("source", None)

with open(DST, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

new_size = os.path.getsize(DST)
pct = (1 - new_size / orig_size) * 100
print(f"Przed: {orig_size / 1024 / 1024:.1f} MB")
print(f"Po:    {new_size / 1024 / 1024:.1f} MB")
print(f"Redukcja: {pct:.0f}%")
