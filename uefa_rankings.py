import json
from pathlib import Path


# Rzeczywiste współczynniki UEFA 2024/25 (przybliżone)
UEFA_COEFFICIENTS = [
    ("GB1", "Anglia",       "Premier League",       104.303),
    ("IT1", "Włochy",       "Serie A",               90.284),
    ("ES1", "Hiszpania",    "La Liga",               89.489),
    ("DE1", "Niemcy",       "Bundesliga",            86.624),
    ("FR1", "Francja",      "Ligue 1",               66.831),
    ("NL1", "Holandia",     "Eredivisie",            61.300),
    ("PO1", "Portugalia",   "Primeira Liga",         56.316),
    ("BE1", "Belgia",       "Jupiler Pro League",    48.000),
    ("TR1", "Turcja",       "Süper Lig",             38.600),
    ("TS1", "Czechy",       "Chance Liga",           36.050),
    ("SC1", "Szkocja",      "Scottish Premiership",  35.350),
    ("A1",  "Szwajcaria",   "Bundesliga AT",         32.975),
    ("GR1", "Grecja",       "Super League",          31.125),
    ("NO1", "Norwegia",     "Eliteserien",           30.750),
    ("DK1", "Dania",        "Superliga DK",          29.950),
    ("C1",  "Chorwacja",    "HNL",                   25.950),
    ("SER1","Serbia",       "SuperLiga SRB",         25.550),
    ("PL1", "Polska",       "PKO BP Ekstraklasa",    25.125),
    ("RU1", "Rosja",        "Premier Liga RU",       22.965),
    ("UKR1","Ukraina",      "Premier Liha",          20.900),
    ("L1",  "Luksemburg",   "Pro League",            19.000),
]


def spots_for_rank(rank: int) -> dict:
    if rank <= 5:
        return {"ucl_spots": 4, "uel_spots": 2, "uecl_spots": 1, "total_spots": 7}
    elif rank <= 7:
        return {"ucl_spots": 3, "uel_spots": 2, "uecl_spots": 1, "total_spots": 6}
    elif rank <= 13:
        return {"ucl_spots": 2, "uel_spots": 1, "uecl_spots": 1, "total_spots": 4}
    elif rank <= 15:
        return {"ucl_spots": 2, "uel_spots": 1, "uecl_spots": 0, "total_spots": 3}
    elif rank <= 25:
        return {"ucl_spots": 1, "uel_spots": 1, "uecl_spots": 0, "total_spots": 2}
    else:
        return {"ucl_spots": 1, "uel_spots": 0, "uecl_spots": 0, "total_spots": 1}


def load_all_codes(players_json: str = "transfermarkt_players.json") -> list[str]:
    path = Path(players_json)
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return [league["competition_code"] for league in data.get("leagues", [])]


def generate(
    output_path: str = "uefa.json",
    players_json: str = "transfermarkt_players.json",
) -> list[dict]:
    coeff_map = {code: (country, league, coeff) for code, country, league, coeff in UEFA_COEFFICIENTS}
    all_codes = load_all_codes(players_json)

    entries = []
    seen = set()

    # Najpierw znane ligi z UEFA
    known = [(c, *coeff_map[c]) for c in coeff_map if c in all_codes or c not in all_codes]
    unknown = [c for c in all_codes if c not in coeff_map]

    ranked = []
    for code, country, league, coeff in known:
        ranked.append((coeff, code, country, league))
        seen.add(code)

    # Nieznane ligi – malejący współczynnik bazowy
    for code in unknown:
        ranked.append((5.0, code, code, code))

    ranked.sort(key=lambda x: (-x[0], x[1]))

    for rank, (coeff, code, country, league) in enumerate(ranked, start=1):
        spots = spots_for_rank(rank)
        entries.append({
            "rank": rank,
            "competition_code": code,
            "country": country,
            "league_name": league,
            "coefficient": coeff,
            **spots,
        })

    payload = {
        "season": "2024/2025",
        "generated_at": None,
        "rankings": entries,
    }

    path = Path(output_path)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Zapisano ranking UEFA ({len(entries)} lig) do {output_path}")
    return entries


def load(path: str = "uefa.json") -> dict | None:
    p = Path(path)
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding="utf-8"))


if __name__ == "__main__":
    generate()
