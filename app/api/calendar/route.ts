import { fetchRaceSchedule, fetchRaces } from "@/lib/api/race";
import { buildIcs } from "@/lib/calendar/ics";
import { seasonEvents, weekendEvents } from "@/lib/calendar/f1Events";
import { buildWeekendSessions } from "@/lib/utils/session";
import { normalizeSeason } from "@/lib/utils/season";

/**
 * Export iCalendar.
 *
 * C'est la moitié du rappel « course imminente » qui fonctionne onglet fermé :
 * l'agenda du téléphone porte l'alarme, pas nous. Sans `round`, la saison
 * entière ; avec, toutes les sessions du week-end.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const season = normalizeSeason(url.searchParams.get("season"));
  const roundBrut = url.searchParams.get("round");

  if (roundBrut !== null && !/^\d+$/.test(roundBrut)) {
    return new Response("Paramètre `round` invalide.", { status: 400 });
  }

  try {
    const races = await fetchRaces(season);

    if (roundBrut === null) {
      const ics = buildIcs(seasonEvents(season, races, url.origin));
      return icsResponse(ics, `cleanlap-${season}.ics`);
    }

    const round = Number(roundBrut);
    const race = races.find((r, i) => (r.round ?? i + 1) === round);
    const planning = await fetchRaceSchedule(season, roundBrut);

    if (!race || !planning) {
      return new Response("Manche introuvable.", { status: 404 });
    }

    const sessions = buildWeekendSessions(planning.schedule);
    if (sessions.length === 0) {
      return new Response("Horaires non publiés pour cette manche.", {
        status: 404,
      });
    }

    const ics = buildIcs(
      weekendEvents(
        season,
        round,
        race.name,
        race.location,
        sessions,
        url.origin,
      ),
    );
    return icsResponse(ics, `cleanlap-${season}-r${round}.ics`);
  } catch (error) {
    // 502 : la panne est chez f1api.dev, pas ici.
    console.error(`[api/calendar] saison ${season} indisponible`, error);
    return new Response("Calendrier momentanément indisponible.", {
      status: 502,
    });
  }
}

function icsResponse(ics: string, filename: string): Response {
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Un horaire de saison bouge rarement, mais il bouge (courses déplacées).
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
