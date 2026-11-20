"""Build CleanLap's compact reference data from an official F1DB release."""

import argparse
import json
import re
import time
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from urllib.request import Request, urlopen
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
JOLPICA = "https://api.jolpi.ca/ergast/f1/"
CIRCUIT_IDS = {
    "albert_park": "melbourne", "americas": "austin", "boavista": "porto",
    "charade": "clermont-ferrand", "essarts": "rouen", "galvez": "buenos-aires",
    "george": "east-london", "lemans": "bugatti", "losail": "lusail",
    "okayama": "aida", "red_bull_ring": "spielberg", "ricard": "paul-ricard",
    "rodriguez": "mexico-city", "sochi": "sirius", "spa": "spa-francorchamps",
    "tremblant": "mont-tremblant", "vegas": "caesars-palace", "villeneuve": "montreal",
}
TEAM_IDS = {
    "alfa": "alfa-romeo", "butterworth": "aston-butterworth", "lago": "talbot-lago",
    "leyton": "leyton-house", "moda": "andrea-moda", "tomaso": "de-tomaso",
    "team_lotus": "lotus", "vhristensen": "christensen",
}


def normalize(value):
    ascii_text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", ascii_text.lower())


def catalogue(path, table, field, local_dir, filename):
    if local_dir:
        return json.loads((local_dir / f"{filename}.json").read_text())
    offset = 0
    rows = []
    while True:
        request = Request(f"{JOLPICA}{path}/?limit=100&offset={offset}",
                          headers={"User-Agent": "CleanLap/0.1.0"})
        with urlopen(request, timeout=15) as response:
            data = json.load(response)["MRData"]
        time.sleep(.26)
        rows.extend(data[table][field])
        offset = int(data["offset"]) + int(data["limit"])
        if offset >= int(data["total"]):
            return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", type=Path)
    parser.add_argument("version")
    parser.add_argument("--catalogues", type=Path, help="Use saved Jolpica catalogue rows.")
    args = parser.parse_args()
    jolpi_drivers = catalogue("drivers", "DriverTable", "Drivers", args.catalogues, "drivers")
    jolpi_teams = catalogue("constructors", "ConstructorTable", "Constructors", args.catalogues, "teams")
    jolpi_circuits = catalogue("circuits", "CircuitTable", "Circuits", args.catalogues, "circuits")

    with ZipFile(args.archive) as archive:
        def rows(table):
            return json.loads(archive.read(f"f1db-{table}.json"))

        drivers = {row["id"]: row for row in rows("drivers")}
        teams = {row["id"]: row for row in rows("constructors")}
        circuits = {row["id"]: row for row in rows("circuits")}
        countries = {row["id"]: row for row in rows("countries")}
        races = {row["id"]: row for row in rows("races")}
        driver_standings = rows("seasons-driver-standings")
        team_standings = rows("seasons-constructor-standings")
        race_results = rows("races-race-results")
        layouts = defaultdict(list)
        for row in rows("circuits-layouts"):
            if row["effective"]:
                layouts[row["circuitId"]].append(row["id"])

        # The providers use different slugs. Date of birth is used only when
        # unique, with an exact normalized name as the other match criterion.
        by_birth = defaultdict(list)
        by_name = {normalize(row["name"]): row["id"] for row in drivers.values()}
        for row in drivers.values():
            if row["dateOfBirth"]:
                by_birth[row["dateOfBirth"]].append(row["id"])
        driver_ids = {}
        for row in jolpi_drivers:
            born = by_birth.get(row.get("dateOfBirth"), [])
            name = normalize(row.get("givenName", "") + row.get("familyName", ""))
            match = by_name.get(name)
            if match in born or not born and match:
                driver_ids[match] = row["driverId"]
            elif len(born) == 1 and not match:
                driver_ids[born[0]] = row["driverId"]

        team_by_id = {normalize(key): key for key in teams}
        team_ids = {}
        for row in jolpi_teams:
            key = row["constructorId"]
            match = TEAM_IDS.get(key) or team_by_id.get(normalize(key))
            if match:
                team_ids[match] = key

        circuit_by_id = {normalize(key): key for key in circuits}
        circuit_ids = {}
        for row in jolpi_circuits:
            key = row["circuitId"]
            match = CIRCUIT_IDS.get(key) or circuit_by_id.get(normalize(key))
            if match:
                circuit_ids[match] = key

        # Ignore scheduled rounds without a published race classification.
        winners = {}
        first_team = {}
        driver_race_teams = defaultdict(Counter)
        for row in race_results:
            if row["positionNumber"] == 1:
                winners.setdefault(row["raceId"], row)
            first_team.setdefault(row["constructorId"], row["year"])
            driver_race_teams[(row["year"], row["driverId"])][row["constructorId"]] += 1

        driver_titles = Counter()
        summaries = {}
        completed_races = Counter(race["year"] for key, race in races.items() if key in winners)
        last_year = max(race["year"] for race in races.values())
        scheduled_count = Counter(race["year"] for race in races.values())
        for row in driver_standings:
            if row["positionNumber"] != 1:
                continue
            year = row["year"]
            if year == last_year and completed_races[year] < scheduled_count[year]:
                continue
            driver = drivers[row["driverId"]]
            nationality = countries[driver["nationalityCountryId"]]["demonym"]
            summaries[str(year)] = {
                "season": str(year), "raceCount": completed_races[year],
                "driverChampion": {"name": driver["name"], "nationality": nationality},
            }
            counts = driver_race_teams[(year, row["driverId"])]
            if len(counts) == 1:
                driver_titles[next(iter(counts))] += 1

        for row in team_standings:
            if row["positionNumber"] == 1 and str(row["year"]) in summaries:
                summaries[str(row["year"])]["constructorChampion"] = teams[row["constructorId"]]["name"]

        references = {}
        for key, provider_id in team_ids.items():
            references[provider_id] = {
                "firstAppearance": first_team.get(key),
                "constructorsChampionships": teams[key]["totalChampionshipWins"],
                "driversChampionships": driver_titles[key],
            }

        circuit_references = {}
        records = {}
        for row in rows("races-fastest-laps"):
            race = races[row["raceId"]]
            layout = race["circuitLayoutId"]
            if row["timeMillis"] and (layout not in records or row["timeMillis"] < records[layout]["timeMillis"]):
                records[layout] = row

        first_circuit = {}
        race_keys = {}
        race_references = {}
        for key, race in races.items():
            circuit = race["circuitId"]
            provider_id = circuit_ids.get(circuit)
            if not provider_id:
                continue
            if key in winners:
                first_circuit.setdefault(circuit, race["year"])
            race_key = f'{race["date"]}/{provider_id}'
            race_keys[key] = race_key
            winner = winners.get(key)
            reference = {
                "circuitLength": round(race["courseLength"] * 1000) if race["courseLength"] else None,
                "corners": race["turns"],
            }
            if winner:
                driver = drivers[winner["driverId"]]
                reference["winner"] = {
                    "name": driver["firstName"], "surname": driver["lastName"],
                    "teamName": teams[winner["constructorId"]]["name"],
                    "teamId": team_ids.get(winner["constructorId"]),
                }
            race_references[race_key] = reference

        for key, provider_id in circuit_ids.items():
            circuit = circuits[key]
            reference = {
                "circuitLength": round(circuit["length"] * 1000) if circuit["length"] else None,
                "corners": circuit["turns"],
                "firstParticipationYear": first_circuit.get(key),
            }
            effective = layouts[key]
            record = records.get(effective[0]) if len(effective) == 1 else None
            if record:
                reference.update({
                    "lapRecord": record["time"],
                    "fastestLapYear": record["year"],
                    "fastestLapDriverId": driver_ids.get(record["driverId"]),
                    "fastestLapTeamId": team_ids.get(record["constructorId"]),
                })
            circuit_references[provider_id] = reference

        practice = {}
        for number in (1, 2, 3):
            for row in rows(f"races-free-practice-{number}-results"):
                if row["raceId"] not in race_keys:
                    continue
                driver = drivers[row["driverId"]]
                nationality = countries[driver["nationalityCountryId"]]["demonym"]
                team = teams[row["constructorId"]]["name"] if row["constructorId"] else None
                key = f'{race_keys[row["raceId"]]}/fp{number}'
                practice.setdefault(key, []).append([
                    row["positionText"], driver["name"], nationality, team, row["time"],
                ])

    # Keep one line per lookup so changes in upstream releases remain reviewable.
    output = {
        "version": args.version, "seasons": summaries, "circuits": circuit_references,
        "teams": references, "races": race_references,
        "countries": {row["iocCode"]: row["demonym"] for row in countries.values() if row["iocCode"]},
    }
    target = ROOT / "lib/api/data"
    for name, content in (("f1db-reference", output), ("f1db-practice", practice)):
        def compact(value):
            return json.dumps(value, ensure_ascii=False, separators=(",", ":"))

        def entries(values, indent):
            return ",\n".join(
                f'{indent}{compact(key)}: {compact(value)}'
                for key, value in sorted(values.items())
            )

        if name == "f1db-reference":
            body = ",\n".join(
                f'  {compact(key)}: {{\n{entries(value, "    ")}\n  }}'
                if isinstance(value, dict) else f'  {compact(key)}: {compact(value)}'
                for key, value in sorted(content.items())
            )
        else:
            body = entries(content, "  ")
        (target / f"{name}.json").write_text("{\n" + body + "\n}\n", encoding="utf-8")


if __name__ == "__main__":
    main()
