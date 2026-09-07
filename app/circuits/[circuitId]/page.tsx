import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SeasonUrlSelect } from "@/components/calendar/SeasonUrlSelect";
import { GhostNumber } from "@/components/paddock/GhostNumber";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { fetchCircuit, fetchCircuitRace } from "@/lib/api/circuits";
import {
  getConstructorLabel,
  getReadableConstructorColor,
} from "@/lib/utils/colors";
import { formatRaceDay } from "@/lib/utils/date";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { normalizeSeason } from "@/lib/utils/season";
import { parseLapTimeMs } from "@/lib/utils/time";

export const revalidate = 60;

type CircuitPageProps = {
  params: Promise<{ circuitId: string }>;
  searchParams: Promise<{ season?: string }>;
};

export async function generateMetadata({
  params,
}: CircuitPageProps): Promise<Metadata> {
  const { circuitId } = await params;
  const circuit = await fetchCircuit(circuitId);
  if (!circuit) notFound();

  return {
    title: `${circuit.name} — CleanLap`,
    description: `Longueur, virages, record du tour et Grand Prix couru sur le circuit de ${circuit.name}.`,
  };
}

/** « 1:21:046 » chez f1api.dev : on l'affiche en 1:21.046. */
function formatLapRecord(raw: string): string {
  const ms = parseLapTimeMs(raw);
  if (ms === null) return raw;

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  const pad = (n: number, size = 2) => String(n).padStart(size, "0");

  return minutes > 0
    ? `${minutes}:${pad(seconds)}.${pad(millis, 3)}`
    : `${seconds}.${pad(millis, 3)}`;
}

export default async function CircuitPage({
  params,
  searchParams,
}: CircuitPageProps) {
  const { circuitId } = await params;
  const { season: requested } = await searchParams;
  const season = normalizeSeason(requested);

  const [circuit, race] = await Promise.all([
    fetchCircuit(circuitId),
    fetchCircuitRace(circuitId, season),
  ]);

  if (!circuit) notFound();

  const flag = countryToFlagEmoji(circuit.country ?? "");
  const winnerColor = getReadableConstructorColor(race?.winnerTeamId ?? "");

  const facts = [
    {
      label: "Longueur",
      value:
        circuit.lengthMeters !== null
          ? `${(circuit.lengthMeters / 1000).toFixed(3)} km`
          : "—",
    },
    { label: "Virages", value: circuit.corners ?? "—" },
    { label: "1re édition", value: circuit.firstSeason ?? "—" },
    {
      label: "Record du tour",
      value: circuit.lapRecord ? formatLapRecord(circuit.lapRecord.time) : "—",
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12 md:py-16">
        <HatchOverlay />
        <GhostNumber className="-bottom-4 left-6 hidden text-[200px] md:left-12 md:block">
          {circuit.corners ?? "F1"}
        </GhostNumber>

        <div className="relative flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-5">
              <SectionEyebrow>Circuit — Saison {season}</SectionEyebrow>
              <h1 className="max-w-3xl text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
                {circuit.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
                <span className="font-semibold">
                  {flag}{" "}
                  {[circuit.city, circuit.country].filter(Boolean).join(", ")}
                </span>
                {circuit.url && (
                  <>
                    <span className="hidden h-4 w-px bg-white/20 sm:block" />
                    <a
                      href={circuit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold uppercase tracking-[0.1em] text-primary underline underline-offset-2 hover:text-primary/80"
                    >
                      Wikipédia ↗
                    </a>
                  </>
                )}
              </div>
            </div>
            <SeasonUrlSelect value={season} triggerClassName="w-[140px] h-11" />
          </div>

          <div className="grid w-fit grid-cols-2 gap-px border border-white/8 bg-white/8 sm:grid-cols-4">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col gap-1.5 bg-background px-7 py-5"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                  {fact.label}
                </span>
                <span className="font-mono text-xl font-extrabold">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>

          {circuit.lapRecord?.driverId && (
            <p className="text-sm text-foreground/55">
              Record détenu par{" "}
              <Link
                href={`/drivers/${circuit.lapRecord.driverId}`}
                className="font-semibold text-foreground underline underline-offset-2"
              >
                {/* L'API ne donne qu'un identifiant (`max_verstappen`) :
                    on le rend lisible sans payer un appel de plus. */}
                {circuit.lapRecord.driverId
                  .split("_")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(" ")}
              </Link>
              {circuit.lapRecord.teamId
                ? ` sur ${getConstructorLabel(circuit.lapRecord.teamId)}`
                : ""}
              {circuit.lapRecord.year ? ` en ${circuit.lapRecord.year}` : ""}.
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
        <SectionEyebrow>Grand Prix {season}</SectionEyebrow>

        {race === undefined ? (
          <p className="border border-dashed border-white/15 p-6 text-sm leading-relaxed text-foreground/55">
            Le calendrier {season} n&apos;a pas pu être chargé. Réessayez dans
            un instant.
          </p>
        ) : race === null ? (
          <p className="border border-dashed border-white/15 p-6 text-sm leading-relaxed text-foreground/55">
            Ce circuit n&apos;est pas au calendrier {season}. Changez de saison
            pour voir la manche qui s&apos;y est courue.
          </p>
        ) : (
          <div className="flex flex-col gap-px border border-white/8 bg-white/8">
            <div className="flex flex-wrap items-center gap-6 bg-background p-6">
              <span className="text-3xl font-black italic text-foreground/40">
                R{race.round ?? "—"}
              </span>
              <div className="flex min-w-[200px] flex-1 flex-col gap-1">
                <span className="text-lg font-extrabold uppercase tracking-wide">
                  {race.name}
                </span>
                <span className="font-mono text-xs text-foreground/55">
                  {formatRaceDay(race.date) ?? "Date inconnue"}
                </span>
              </div>

              {race.winner && (
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-1"
                    aria-hidden
                    style={{ background: winnerColor }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                      Vainqueur
                    </span>
                    <span className="text-sm font-extrabold uppercase">
                      {race.winner}
                    </span>
                  </div>
                </div>
              )}

              {race.round !== null && (
                <Link
                  href={`/results/${season}/${race.round}`}
                  className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80"
                >
                  Résultats →
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
