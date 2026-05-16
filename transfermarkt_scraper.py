import argparse
import json
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, UTC
from html import unescape
from typing import Iterable
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


BASE_URL = "https://www.transfermarkt.pl"
DEFAULT_START_URL = f"{BASE_URL}/wettbewerbe/europa"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/136.0.0.0 Safari/537.36"
)
CLUB_URL_RE = re.compile(r"/startseite/verein/(\d+)")
PLAYER_URL_RE = re.compile(r"/profil/spieler/(\d+)")
COMPETITION_URL_RE = re.compile(r"/startseite/wettbewerb/([^/?#]+)")


def clean_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value).strip()


def normalize_url(url: str) -> str:
    if not url:
        return ""
    return urljoin(BASE_URL, url)


def extract_image_url(tag) -> str:
    if tag is None:
        return ""

    for attr in ("data-src", "data-original", "src"):
        value = clean_text(tag.get(attr))
        if not value or value.startswith("data:image/"):
            continue
        if value.startswith("//"):
            return f"https:{value}"
        return normalize_url(value)

    return ""


def parse_market_value_eur(raw_value: str) -> int | None:
    text = clean_text(raw_value).replace("\xa0", " ")
    if not text:
        return None

    normalized = text.lower().replace("€", "").strip()
    multiplier = 1
    if "mld" in normalized:
        multiplier = 1_000_000_000
    elif "mln" in normalized:
        multiplier = 1_000_000
    elif "tys" in normalized:
        multiplier = 1_000

    number_match = re.search(r"(\d+(?:[.,]\d+)?)", normalized)
    if not number_match:
        return None

    number = float(number_match.group(1).replace(".", "").replace(",", "."))
    return int(number * multiplier)


def ensure_season_id(url: str, season_id: int | None) -> str:
    if not url or season_id is None or "/saison_id/" in url:
        return url
    return f"{url.rstrip('/')}/saison_id/{season_id}"


def normalize_club_logo_url(url: str, club_id: str) -> str:
    cleaned = clean_text(url)
    lowered = cleaned.lower()
    if cleaned.startswith("http") and "transfermarkt_files/" not in lowered:
        return cleaned
    if club_id:
        return f"https://tmssl.akamaized.net//images/wappen/tiny/{club_id}.png"
    return cleaned


class TransfermarktScraper:
    def __init__(self, delay_seconds: float = 0.2, timeout_seconds: int = 30, max_workers: int = 3):
        self.delay_seconds = delay_seconds
        self.timeout_seconds = timeout_seconds
        self.max_workers = max_workers
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": USER_AGENT,
                "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.8",
                "Referer": BASE_URL,
            }
        )
        self.request_count = 0
        self._lock = threading.Lock()

    def log(self, message: str) -> None:
        print(message, flush=True)

    def fetch_html(self, url: str) -> str:
        with self._lock:
            self.request_count += 1
            idx = self.request_count
        self.log(f"[{idx}] GET {url}")
        response = self.session.get(url, timeout=self.timeout_seconds)
        response.raise_for_status()
        if self.delay_seconds > 0:
            time.sleep(self.delay_seconds)
        return response.text

    def scrape(
        self,
        start_url: str,
        output_path: str,
        season_id: int | None = 2025,
        max_leagues: int | None = None,
        max_clubs_per_league: int | None = None,
        max_competition_pages: int = 2,
        league_url: str | None = None,
        club_url: str | None = None,
        player_url: str | None = None,
    ) -> dict:
        if player_url:
            self.log(f"Scraping jednego zawodnika: {player_url}")
            player_result = self.scrape_player(normalize_url(player_url))
            payload = self.build_payload(
                start_url=normalize_url(player_url),
                league_entries=[],
                player_entries=player_result["players"],
            )
        elif club_url:
            self.log(f"Scraping jednego klubu: {club_url}")
            club = self.scrape_club(ensure_season_id(normalize_url(club_url), season_id))
            payload = self.build_payload(
                start_url=normalize_url(club_url),
                league_entries=[],
                player_entries=club["players"],
            )
        elif league_url:
            self.log(f"Scraping jednej ligi: {league_url}")
            players, league_entries = self.scrape_single_league(
                ensure_season_id(normalize_url(league_url), season_id),
                season_id=season_id,
                max_clubs=max_clubs_per_league,
            )
            payload = self.build_payload(
                start_url=normalize_url(league_url),
                league_entries=league_entries,
                player_entries=players,
            )
        else:
            self.log(f"Pobieram listę rozgrywek z: {start_url}")
            leagues = self.scrape_competitions(start_url, max_pages=max_competition_pages)
            if max_leagues is not None:
                leagues = leagues[:max_leagues]

            all_players: list[dict] = []
            scraped_leagues: list[dict] = []
            total_leagues = len(leagues)
            for league_index, league in enumerate(leagues, start=1):
                self.log(
                    f"[Liga {league_index}/{total_leagues}] {league['name']} -> {league['url']}"
                )
                players, league_entries = self.scrape_single_league(
                    league["url"],
                    season_id=season_id,
                    max_clubs=max_clubs_per_league,
                )
                all_players.extend(players)
                scraped_leagues.extend(league_entries)
                partial_payload = self.build_payload(
                    start_url=start_url,
                    league_entries=scraped_leagues,
                    player_entries=all_players,
                )
                with open(output_path, "w", encoding="utf-8") as handle:
                    json.dump(partial_payload, handle, ensure_ascii=False, indent=2)
                self.log(
                    f"Zapis częściowy: {partial_payload['player_count']} zawodników "
                    f"do {output_path}"
                )

            payload = self.build_payload(
                start_url=start_url,
                league_entries=scraped_leagues,
                player_entries=all_players,
            )

        with open(output_path, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)

        return payload

    def build_payload(
        self,
        start_url: str,
        league_entries: list[dict],
        player_entries: list[dict],
    ) -> dict:
        return {
            "scraped_at_utc": datetime.now(UTC).isoformat(),
            "source": clean_text(start_url),
            "league_count": len({league["url"] for league in league_entries}),
            "club_count": len(
                {
                    player["club"]["url"]
                    for player in player_entries
                    if player.get("club", {}).get("url")
                }
            ),
            "player_count": len(player_entries),
            "leagues": league_entries,
            "players": player_entries,
        }

    def scrape_competitions(self, start_url: str, max_pages: int = 2) -> list[dict]:
        pending = [normalize_url(start_url)]
        seen_pages: set[str] = set()
        seen_leagues: set[str] = set()
        leagues: list[dict] = []

        while pending:
            page_url = pending.pop(0)
            if page_url in seen_pages:
                continue
            if max_pages is not None and len(seen_pages) >= max_pages:
                break
            seen_pages.add(page_url)
            self.log(f"[Strona rozgrywek {len(seen_pages)}/{max_pages}] {page_url}")

            soup = BeautifulSoup(self.fetch_html(page_url), "html.parser")
            for anchor in soup.select("a[href*='/startseite/wettbewerb/']"):
                href = normalize_url(anchor.get("href", ""))
                if not href or href in seen_leagues:
                    continue
                if "/verein/" in href or "#" in href:
                    continue

                competition_code_match = COMPETITION_URL_RE.search(href)
                league_name = clean_text(anchor.get("title") or anchor.get_text(" ", strip=True))
                if not competition_code_match or not league_name:
                    continue

                seen_leagues.add(href)
                leagues.append(
                    {
                        "name": league_name,
                        "url": href,
                        "competition_code": competition_code_match.group(1),
                    }
                )

            next_link = soup.select_one("link[rel='next']")
            next_url = normalize_url(next_link.get("href", "")) if next_link else ""
            if (
                next_url
                and next_url not in seen_pages
                and (max_pages is None or len(seen_pages) < max_pages)
            ):
                pending.append(next_url)

        return leagues

    def scrape_single_league(
        self,
        league_url: str,
        season_id: int | None,
        max_clubs: int | None = None,
    ) -> tuple[list[dict], list[dict]]:
        soup = BeautifulSoup(self.fetch_html(league_url), "html.parser")
        league_meta = self.parse_league_meta(soup, league_url)
        clubs = self.parse_league_clubs(soup, league_url, season_id)
        if max_clubs is not None:
            clubs = clubs[:max_clubs]

        players: list[dict] = []
        total_clubs = len(clubs)
        workers = min(self.max_workers, total_clubs) if total_clubs else 1

        with ThreadPoolExecutor(max_workers=workers) as executor:
            future_to_club = {
                executor.submit(
                    self.scrape_club, club["url"], fallback_club=club, fallback_league=league_meta
                ): club
                for club in clubs
            }
            for future in as_completed(future_to_club):
                club = future_to_club[future]
                try:
                    club_result = future.result()
                    players.extend(club_result["players"])
                    self.log(
                        f"  [Klub {clubs.index(club) + 1}/{total_clubs}] {club['name']} -> "
                        f"{len(club_result['players'])} zawodników; łącznie: {len(players)}"
                    )
                except Exception as e:
                    self.log(f"  [Błąd] {club['name']}: {e}")

        league_entry = {
            **league_meta,
            "club_count": len(clubs),
            "clubs": clubs,
        }
        return players, [league_entry]

    def parse_league_meta(self, soup: BeautifulSoup, league_url: str) -> dict:
        title = clean_text(soup.title.get_text(" ", strip=True) if soup.title else "")
        h1 = clean_text(soup.select_one("h1").get_text(" ", strip=True) if soup.select_one("h1") else "")
        competition_code_match = COMPETITION_URL_RE.search(league_url)

        return {
            "name": h1 or title or league_url.rstrip("/").split("/")[-1],
            "url": league_url,
            "competition_code": competition_code_match.group(1) if competition_code_match else "",
        }

    def parse_league_clubs(
        self,
        soup: BeautifulSoup,
        league_url: str,
        season_id: int | None,
    ) -> list[dict]:
        clubs: list[dict] = []
        seen_urls: set[str] = set()

        for row in soup.select("table.items tbody tr"):
            club_anchor = row.select_one("td.hauptlink.no-border-links a[href*='/startseite/verein/']")
            if club_anchor is None:
                continue

            club_url = ensure_season_id(normalize_url(club_anchor.get("href", "")), season_id)
            if not club_url or club_url in seen_urls:
                continue

            seen_urls.add(club_url)
            club_name = clean_text(club_anchor.get("title") or club_anchor.get_text(" ", strip=True))
            logo_img = row.select_one("td img")
            club_id_match = CLUB_URL_RE.search(club_url)
            club_id = club_id_match.group(1) if club_id_match else ""
            clubs.append(
                {
                    "name": club_name,
                    "url": club_url,
                    "club_id": club_id,
                    "logo_url": normalize_club_logo_url(extract_image_url(logo_img), club_id),
                    "league_url": league_url,
                }
            )

        return clubs

    def scrape_club(
        self,
        club_url: str,
        fallback_club: dict | None = None,
        fallback_league: dict | None = None,
    ) -> dict:
        soup = BeautifulSoup(self.fetch_html(club_url), "html.parser")
        club_info = self.parse_club_info(soup, club_url, fallback_club, fallback_league)
        players = self.parse_club_players(soup, club_info)
        return {"club": club_info, "players": players}

    def parse_club_info(
        self,
        soup: BeautifulSoup,
        club_url: str,
        fallback_club: dict | None = None,
        fallback_league: dict | None = None,
    ) -> dict:
        title = clean_text(soup.title.get_text(" ", strip=True) if soup.title else "")
        h1 = clean_text(soup.select_one("h1").get_text(" ", strip=True) if soup.select_one("h1") else "")
        club_id_match = CLUB_URL_RE.search(club_url)
        club_id = club_id_match.group(1) if club_id_match else ""
        club_name = (
            clean_text((fallback_club or {}).get("name"))
            or h1
            or title.replace(" - Profil klubu | Transfermarkt", "")
            or club_url.rstrip("/").split("/")[-1]
        )

        logo_url = normalize_club_logo_url(clean_text((fallback_club or {}).get("logo_url")), club_id)
        if not logo_url:
            logo_url = normalize_club_logo_url(self.find_club_logo(soup, club_id, club_name), club_id)

        league = {
            "name": clean_text((fallback_league or {}).get("name")),
            "url": clean_text((fallback_league or {}).get("url")),
            "competition_code": clean_text((fallback_league or {}).get("competition_code")),
        }

        return {
            "name": club_name,
            "url": club_url,
            "club_id": club_id,
            "logo_url": logo_url,
            "league": league,
        }

    def find_club_logo(self, soup: BeautifulSoup, club_id: str, club_name: str) -> str:
        selectors: list[tuple[str, str]] = []
        if club_id:
            selectors.extend(
                [
                    ("img", f"src*='/images/wappen/headerRund/{club_id}.png'"),
                    ("img", f"src*='/images/wappen/tiny/{club_id}.png'"),
                    ("img", f"src*='/images/wappen/homepage/{club_id}.png'"),
                ]
            )

        for _, selector in selectors:
            img = soup.select_one(selector)
            logo_url = extract_image_url(img)
            if logo_url:
                return logo_url

        for img in soup.select("img[title], img[alt]"):
            label = clean_text(img.get("title") or img.get("alt"))
            src = extract_image_url(img)
            if label == club_name and "/images/wappen/" in src:
                return src

        return ""

    def parse_club_players(self, soup: BeautifulSoup, club_info: dict) -> list[dict]:
        players: list[dict] = []
        seen_player_ids: set[str] = set()

        for row in soup.select("table.items tbody tr"):
            player_anchor = row.select_one("table.inline-table td.hauptlink a[href*='/profil/spieler/']")
            if player_anchor is None:
                continue

            player_url = normalize_url(player_anchor.get("href", ""))
            player_id_match = PLAYER_URL_RE.search(player_url)
            player_id = player_id_match.group(1) if player_id_match else ""
            if player_id and player_id in seen_player_ids:
                continue
            if player_id:
                seen_player_ids.add(player_id)

            cells = row.find_all("td", recursive=False)
            if len(cells) < 5:
                continue

            position_cell = row.select_one("table.inline-table tr:nth-of-type(2) td")
            nationality_images = cells[3].select("img.flaggenrahmen")
            player_name = clean_text(player_anchor.get_text(" ", strip=True))
            photo_url = extract_image_url(row.select_one("table.inline-table img"))
            date_of_birth = clean_text(cells[2].get_text(" ", strip=True))
            market_value = clean_text(cells[4].get_text(" ", strip=True))

            players.append(
                {
                    "player_id": player_id,
                    "name": player_name,
                    "url": player_url,
                    "position": clean_text(position_cell.get_text(" ", strip=True) if position_cell else ""),
                    "date_of_birth": date_of_birth,
                    "nationalities": self.parse_nationalities(nationality_images),
                    "market_value": market_value,
                    "market_value_eur": parse_market_value_eur(market_value),
                    "photo_url": photo_url,
                    "club": {
                        "name": club_info["name"],
                        "url": club_info["url"],
                        "club_id": club_info["club_id"],
                        "logo_url": club_info["logo_url"],
                    },
                    "league": club_info["league"],
                }
            )

        return players

    def parse_nationalities(self, images: Iterable) -> list[dict]:
        nationalities: list[dict] = []
        for image in images:
            name = clean_text(image.get("title") or image.get("alt"))
            flag_url = extract_image_url(image)
            if not name:
                continue
            nationalities.append({"name": unescape(name), "flag_url": flag_url})
        return nationalities

    def scrape_player(self, player_url: str) -> dict:
        soup = BeautifulSoup(self.fetch_html(player_url), "html.parser")
        player_data = self.parse_player_profile(soup, player_url)
        return {"players": [player_data]}

    def parse_player_profile(self, soup: BeautifulSoup, player_url: str) -> dict:
        player_id_match = PLAYER_URL_RE.search(player_url)
        player_id = player_id_match.group(1) if player_id_match else ""

        title = clean_text(soup.title.get_text(" ", strip=True) if soup.title else "")
        h1 = clean_text(soup.select_one("h1").get_text(" ", strip=True) if soup.select_one("h1") else "")
        player_name = h1 or title

        photo_url = extract_image_url(
            soup.select_one("img.kader-profil-bild, img.data-header__image, img.spielerfoto")
        )

        position = ""
        for pos_sel in [".detail-position__position", ".data-header__position"]:
            pos_elem = soup.select_one(pos_sel)
            if pos_elem:
                position = clean_text(pos_elem.get_text(" ", strip=True))
                if position:
                    break

        info_rows = soup.select("table.auflistung tr")
        info_map: dict[str, str] = {}
        for row in info_rows:
            cells = row.find_all("td")
            if len(cells) >= 2:
                key = clean_text(cells[0].get_text(" ", strip=True)).lower().rstrip(":")
                value = clean_text(cells[1].get_text(" ", strip=True))
                if key and value:
                    info_map[key] = value

        date_of_birth = info_map.get("data urodzenia") or info_map.get("date of birth") or ""

        nationalities = self.parse_nationalities(
            soup.select("img.flaggenrahmen")
        )

        market_value = ""
        mw_elem = soup.select_one(".marktwert, .mw-header")
        if mw_elem:
            market_value = clean_text(mw_elem.get_text(" ", strip=True))

        club_name = ""
        club_url = ""
        club_id = ""
        for club_link in soup.select("a[href*='/startseite/verein/']"):
            href = clean_text(club_link.get("href", ""))
            name = clean_text(club_link.get("title") or club_link.get_text(" ", strip=True))
            if href and name and "/verein/" in href:
                club_url = normalize_url(href)
                cid = CLUB_URL_RE.search(club_url)
                club_id = cid.group(1) if cid else ""
                club_name = name
                break

        league_name = ""
        league_url = ""
        competition_code = ""
        for league_link in soup.select("a[href*='/startseite/wettbewerb/']"):
            href = clean_text(league_link.get("href", ""))
            name = clean_text(league_link.get("title") or league_link.get_text(" ", strip=True))
            if href and name:
                league_url = normalize_url(href)
                code_match = COMPETITION_URL_RE.search(league_url)
                competition_code = code_match.group(1) if code_match else ""
                league_name = name
                break

        return {
            "player_id": player_id,
            "name": player_name,
            "url": player_url,
            "position": position,
            "date_of_birth": date_of_birth,
            "nationalities": nationalities,
            "market_value": market_value,
            "market_value_eur": parse_market_value_eur(market_value),
            "photo_url": photo_url,
            "club": {
                "name": club_name,
                "url": club_url,
                "club_id": club_id,
                "logo_url": "",
            },
            "league": {
                "name": league_name,
                "url": league_url,
                "competition_code": competition_code,
            },
        }


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Scraper Transfermarkt: Europa -> ligi -> kluby -> zawodnicy -> JSON"
        )
    )
    parser.add_argument(
        "--start-url",
        default=DEFAULT_START_URL,
        help="Adres startowy z listą rozgrywek. Domyślnie: strona Europa.",
    )
    parser.add_argument(
        "--league-url",
        help="Jeśli podasz, scraper ominie stronę Europa i zescrapuje tylko tę ligę.",
    )
    parser.add_argument(
        "--club-url",
        help="Jeśli podasz, scraper zescrapuje tylko jeden klub.",
    )
    parser.add_argument(
        "--player-url",
        help="Jeśli podasz, scraper zescrapuje tylko jednego zawodnika (profil/spieler/...).",
    )
    parser.add_argument(
        "--season-id",
        type=int,
        default=2025,
        help="Sezon dodawany do linków klubów, gdy go brakuje. Domyślnie: 2025.",
    )
    parser.add_argument(
        "--output",
        default="transfermarkt_players.json",
        help="Nazwa pliku JSON wyjściowego.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.2,
        help="Opóźnienie między requestami w sekundach. Domyślnie: 0.2.",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="Timeout requestu HTTP w sekundach. Domyślnie: 30.",
    )
    parser.add_argument(
        "--max-leagues",
        type=int,
        help="Opcjonalnie ogranicz liczbę lig.",
    )
    parser.add_argument(
        "--max-clubs-per-league",
        type=int,
        help="Opcjonalnie ogranicz liczbę klubów na ligę.",
    )
    parser.add_argument(
        "--max-competition-pages",
        type=int,
        default=2,
        help="Ile stron paginacji pobrać z listy rozgrywek Europa. Domyślnie: 2.",
    )
    parser.add_argument(
        "--max-workers",
        type=int,
        default=3,
        help="Maksymalna liczba równoległych zapytań (przyspiesza scrapowanie ligi). Domyślnie: 3.",
    )
    return parser


def main() -> None:
    parser = build_argument_parser()
    args = parser.parse_args()

    scraper = TransfermarktScraper(
        delay_seconds=args.delay,
        timeout_seconds=args.timeout,
        max_workers=args.max_workers,
    )
    payload = scraper.scrape(
        start_url=normalize_url(args.start_url),
        output_path=args.output,
        season_id=args.season_id,
        max_leagues=args.max_leagues,
        max_clubs_per_league=args.max_clubs_per_league,
        max_competition_pages=args.max_competition_pages,
        league_url=args.league_url,
        club_url=args.club_url,
        player_url=args.player_url,
    )

    print(
        f"Zapisano {payload['player_count']} zawodników "
        f"z {payload['club_count']} klubów i {payload['league_count']} lig "
        f"do pliku {args.output}"
    )


if __name__ == "__main__":
    main()
