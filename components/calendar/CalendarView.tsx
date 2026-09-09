import Link from "next/link";

import { RaceRow } from "@/components/calendar/RaceRow";
import {
  isThisWeekend,
  splitSeasonRaces,
} from "@/features/season/splitSeasonRaces";
import { SeasonUrlSelect } from "@/components/calendar/SeasonUrlSelect";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { getRacesWithWinner } from "@/features/results/hooks";
import { getConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { formatRaceDay, formatSessionTime, toRaceDate } from "@/lib/utils/date";

type RaceWithWinner = Awaited<ReturnType<typeof getRacesWithWinner>>[number];

/**
 * Vue du calendrier, rendue côté serveur. La saison vient de l'URL (`?season=`)
 * et non plus d'un `useState` : le lien est partageable et le retour arrière
 * du navigateur fonctionne.
 *
 * `races === null` = calendrier indisponible (l'appel a échoué), `[]` = saison
 * connue mais sans course. Sans cette distinction, une panne de l'API était
 * indiscernable d'une saison vide.
 */
export function CalendarView({
  season,
  races,
}: {
  season: string;
  races: RaceWithWinner[] | null;
}) {
  // Une seule horloge pour tout le rendu : sinon deux appels à `new Date()`
  // peuvent tomber de part et d'autre d'un départ de course.
  const now = new Date();
  const { completed: completedRaces, remaining: remainingRaces } =
    splitSeasonRaces(races ?? [], now);
  const nextRound = remainingRaces[0]?.round;

  /**
   * Ex. « 05 sept. · 15:00 ». Passe par les helpers partagés : la construction
   * manuelle d'un `Date` retombait sur minuit UTC quand l'API ne donne pas
   * d'heure, ce qui affichait la veille dans tout fuseau en retard sur UTC. Et
   * l'heure est rendue en heure de Paris, comme partout ailleurs dans l'app,
   * au lieu du fuseau du navigateur.
   */
  const formatDateLabel = (race: RaceWithWinner) => {
    const day = formatRaceDay(race.date, race.time, {
      day: "2-digit",
      month: "short",
    });
    if (!day) return race.date;

    const parsed = race.time ? toRaceDate(race.date, race.time) : null;
    return parsed ? `${day} · ${formatSessionTime(parsed)}` : day;
  };

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-center gap-4">
              <SectionEyebrow>
                Saison {season} — {races?.length ?? "—"} Grands Prix
              </SectionEyebrow>
              <SeasonUrlSelect value={season} triggerClassName="w-[120px]" />
            </div>
            <h1 className="text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Calendrier
            </h1>
            {/* Les circuits n'ont pas d'entrée de navigation propre : la barre
                est pleine à huit entrées. On y accède depuis le calendrier,
                leur contexte naturel. */}
            <Link
              href={`/circuits?season=${season}`}
              className="w-fit text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80"
            >
              Voir tous les circuits →
            </Link>
          </div>
          {/* En grille pleine largeur sur mobile : les trois tuiles côte à côte
              en `px-7` réclamaient 398 px, soit plus que l'écran. */}
          <div className="grid w-full grid-cols-3 gap-px border border-white/8 bg-white/8 sm:flex sm:w-auto">
            {[
              // Pas de "0" trompeur quand la saison n'a pas pu être chargée.
              { value: races?.length ?? "—", label: "Manches" },
              {
                value: races ? completedRaces.length : "—",
                label: "Disputées",
              },
              {
                value: races ? remainingRaces.length : "—",
                label: "Restantes",
                accent: true,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex min-w-0 flex-col gap-0.5 bg-background px-3 py-3 sm:px-7 sm:py-4"
              >
                <span
                  className={
                    "text-2xl font-extrabold leading-none sm:text-3xl " +
                    (stat.accent ? "text-primary" : "")
                  }
                >
                  {stat.value}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/50 sm:text-[11px] sm:tracking-[0.15em]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {races === null ? (
        <section className="flex flex-col gap-4 px-6 py-10 md:px-12">
          <h2 className="text-2xl font-black italic uppercase tracking-tight">
            Saison indisponible
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-foreground/55">
            Aucune donnée pour la saison {season}. Elle n&apos;est peut-être pas
            au calendrier, ou l&apos;API est momentanément indisponible.
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-10 px-6 py-10 md:px-12">
          <div className="flex flex-col gap-4">
            <SectionEyebrow>À venir</SectionEyebrow>
            <div className="flex flex-col border-t border-border">
              {remainingRaces.length === 0 && (
                <p className="py-4 text-sm text-foreground/50">
                  Aucune course restante pour cette saison.
                </p>
              )}
              {remainingRaces.map((race) => {
                const isNext = race.round === nextRound;
                const flag = countryToFlagEmoji(
                  race.location.split(", ").at(-1) || "",
                );
                return (
                  <RaceRow
                    key={race.round}
                    round={race.round}
                    flag={flag}
                    name={race.name}
                    subtitle={`${race.circuit ? `${race.circuit} — ` : ""}${race.location}`}
                    accentColor={isNext ? "var(--primary)" : undefined}
                    className="pl-3 transition-colors hover:bg-[#12151a] sm:pl-4"
                    style={{
                      borderLeft: `3px solid ${isNext ? "var(--primary)" : "transparent"}`,
                      background: isNext ? "#12151a" : "transparent",
                    }}
                  >
                    {isNext && (
                      <span className="bg-primary px-3 py-[5px] text-[11px] font-extrabold italic uppercase tracking-[0.1em] text-primary-foreground">
                        {isThisWeekend(race, now) ? "Ce week-end" : "Prochaine"}
                      </span>
                    )}
                    <span className="ml-auto whitespace-nowrap font-mono text-[13px] text-foreground/70 sm:ml-0 sm:w-[130px] sm:text-right">
                      {formatDateLabel(race)}
                    </span>
                  </RaceRow>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <SectionEyebrow>Disputées</SectionEyebrow>
            <div className="flex flex-col border-t border-border">
              {completedRaces.length === 0 && (
                <p className="py-4 text-sm text-foreground/50">
                  La saison n&apos;a pas encore commencé.
                </p>
              )}
              {completedRaces.map((race) => {
                const flag = countryToFlagEmoji(
                  race.location.split(", ").at(-1) || "",
                );
                const winnerColor = getConstructorColor(race.winnerTeam || "");
                return (
                  <RaceRow
                    key={race.round}
                    round={race.round}
                    flag={flag}
                    name={race.name}
                    subtitle={`${race.circuit ? `${race.circuit} — ` : ""}${race.location}`}
                    className="transition-colors hover:bg-[#12151a]"
                  >
                    {race.winner && (
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="h-5 w-1 shrink-0"
                          style={{ background: winnerColor }}
                        />
                        <span className="truncate text-[13px] font-semibold uppercase">
                          {race.winner}
                        </span>
                      </div>
                    )}
                    <span className="whitespace-nowrap font-mono text-[13px] text-foreground/50 sm:w-[100px] sm:text-right">
                      {formatDateLabel(race)}
                    </span>
                    <Link
                      href={`/results/${season}/${race.round}`}
                      className="ml-auto whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80 sm:ml-0"
                    >
                      Résultats →
                    </Link>
                  </RaceRow>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
