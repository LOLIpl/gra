import argparse
import json
import re
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from transfermarkt_scraper import (
    BASE_URL,
    TransfermarktScraper,
)


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    return s.strip("-")


def build_club_url(name: str, club_id: str, season_id: int | None = 2025) -> str:
    slug = slugify(name)
    url = f"{BASE_URL}/{slug}/kader/verein/{club_id}"
    if season_id is not None:
        url = f"{url}/saison_id/{season_id}"
    return url


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scraper zawodnikow na podstawie lig/klubow z transfermarkt_players.json"
    )
    parser.add_argument("--input", default="transfermarkt_players.json")
    parser.add_argument("--output", default="transfermarkt_players.json")
    parser.add_argument("--season-id", type=int, default=2025)
    parser.add_argument("--delay", type=float, default=0.3)
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--max-workers", type=int, default=2)
    parser.add_argument("--max-leagues", type=int, help="Ogranicz liczbe lig")
    parser.add_argument("--max-clubs", type=int, help="Ogranicz liczbe klubow na lige")
    parser.add_argument("--league-code", type=str, help="Scrapuj tylko konkretna lige (kod, np. PL1)")
    parser.add_argument("--club-id", type=str, help="Scrapuj tylko konkretny klub (ID)")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Brak pliku: {args.input}")
        return

    raw = json.loads(input_path.read_text(encoding="utf-8"))
    leagues: list[dict] = raw.get("leagues", [])

    if args.league_code:
        leagues = [l for l in leagues if l.get("competition_code", "").upper() == args.league_code.upper()]
        if not leagues:
            print(f"Nie znaleziono ligi o kodzie: {args.league_code}")
            return
        print(f"Filtrowanie: tylko liga {args.league_code}")

    if args.max_leagues:
        leagues = leagues[: args.max_leagues]

    scraper = TransfermarktScraper(
        delay_seconds=args.delay,
        timeout_seconds=args.timeout,
        max_workers=args.max_workers,
    )

    all_players: list[dict] = []
    total_leagues = len(leagues)

    for league_idx, league in enumerate(leagues, start=1):
        league_name = league.get("name", "")
        league_url = league.get("url", "")
        competition_code = league.get("competition_code", "")
        clubs: list[dict] = league.get("clubs", [])

        if args.club_id:
            clubs = [c for c in clubs if c.get("club_id") == args.club_id]
            if not clubs:
                print(f"Nie znaleziono klubu o ID: {args.club_id}")
                continue

        if args.max_clubs:
            clubs = clubs[: args.max_clubs]

        if not clubs:
            continue

        print(f"[Liga {league_idx}/{total_leagues}] {league_name} ({competition_code}) - {len(clubs)} klubow")

        league_players: list[dict] = []
        total_clubs = len(clubs)
        workers = min(args.max_workers, total_clubs) if total_clubs else 1

        with ThreadPoolExecutor(max_workers=workers) as executor:
            future_to_club = {}
            for club in clubs:
                club_id = club.get("club_id", "")
                club_name = club.get("name", "")
                club_url = build_club_url(club_name, club_id, args.season_id)
                fallback_league = {
                    "name": league_name,
                    "url": league_url,
                    "competition_code": competition_code,
                }
                future = executor.submit(
                    scraper.scrape_club,
                    club_url,
                    fallback_club=club,
                    fallback_league=fallback_league,
                )
                future_to_club[future] = (club_name, club_id)

            for future in as_completed(future_to_club):
                club_name, club_id = future_to_club[future]
                try:
                    result = future.result()
                    club_players = result["players"]
                    league_players.extend(club_players)
                    club_idx = next(i for i, c in enumerate(clubs) if c.get("club_id") == club_id) + 1
                    print(f"  [Klub {club_idx}/{total_clubs}] {club_name} -> {len(club_players)} zawodnikow; lacznie w lidze: {len(league_players)}")
                except Exception as e:
                    print(f"  [Blad] {club_name}: {e}")

        all_players.extend(league_players)

        payload = {
            "scraped_at_utc": raw.get("scraped_at_utc", ""),
            "source": raw.get("source", ""),
            "league_count": len(leagues),
            "club_count": len({p.get("club", {}).get("url") for p in all_players if p.get("club", {}).get("url")}),
            "player_count": len(all_players),
            "leagues": leagues,
            "players": all_players,
        }
        input_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Zapis czesciowy: {payload['player_count']} zawodnikow do {args.input}")

    print(f"\nGotowe! Zapisano {len(all_players)} zawodnikow do {args.output}")


if __name__ == "__main__":
    main()
