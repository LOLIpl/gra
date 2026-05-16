import json
import re


# Znane kody które nie kończą się na 1/2 ale są 1. ligą
KNOWN_TOP = {"FARO", "GZO1"}

# Kody kończące się na 1/2 ale niebędące 1./2. ligą
KNOWN_TOP |= {"MT1N", "MT1P", "GE1N", "MO1N"}

# Kody kończące się na 2 które NIE są 2. ligą (np. faza play-off)
SECOND_TIER_OVERRIDES: set[str] = {"MOP2"}

# Kody które NIE są ligami (puchary, eliminacje)
NON_LEAGUE = {"POWM"}


def classify_league(code: str, name: str) -> str:
    if code in NON_LEAGUE:
        return "puchar/inne"

    # Kończy się na "2" i nie ma override
    if code.endswith("2") and code not in SECOND_TIER_OVERRIDES:
        return "2. liga"

    # Kończy się na "1" lub znana 1. liga
    if code.endswith("1") or code in KNOWN_TOP:
        return "1. liga"

    # Reszta
    return "inne"


def main():
    with open("transfermarkt_players.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"{'Kod':6s} {'Tier':10s} {'Nazwa ligi'}")
    print("-" * 60)
    tiers: dict[str, list[str]] = {"1. liga": [], "2. liga": [], "puchar/inne": [], "inne": []}

    for league in data["leagues"]:
        code = league["competition_code"]
        name = league["name"]
        tier = classify_league(code, name)
        tiers.setdefault(tier, []).append(code)
        print(f"{code:6s} {tier:10s} {name}")

    print("\n--- Podsumowanie ---")
    for t, codes in tiers.items():
        print(f"{t}: {len(codes)} lig ({', '.join(codes)})")


def get_league_tier(code: str) -> str:
    return classify_league(code, "")


def is_first_division(code: str) -> bool:
    return classify_league(code, "") == "1. liga"


def is_second_division(code: str) -> bool:
    return classify_league(code, "") == "2. liga"


if __name__ == "__main__":
    main()
