import type { Metadata } from "next";
import Link from "next/link";

import { SeasonUrlSelect } from "@/components/calendar/SeasonUrlSelect";
import { DriverPicker } from "@/components/compare/DriverPicker";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { compareDrivers } from "@/features/compare/compareDrivers";
import { fetchDriverSeason, fetchDrivers } from "@/lib/api/drivers";
import { getReadableConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { normalizeSeason } from "@/lib/utils/season";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Comparateur de pilotes — CleanLap",
  description:
    "Comparez deux pilotes de Formule 1 sur une saison : duels en course et en qualification, victoires, podiums, poles et abandons.",
};

type ComparePageProps = {
  searchParams: Promise<{ season?: string; d1?: string; d2?: string }>;
};

function Bar({
  value,
  max,
  color,
  align,
}: {
  value: number;
  max: number;
  color: string;
  align: "left" | "right";
}) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className={`h-1.5 flex-1 bg-white/7 ${align === "right" ? "flex justify-end" : ""}`}
    >
      <div
        className="h-1.5"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const season = normalizeSeason(params.season);

  const drivers = await fetchDrivers({ season });
  const d1 = params.d1 ?? drivers[0]?.id ?? null;
  const d2 = params.d2 ?? drivers[1]?.id ?? null;

  const [seasonA, seasonB] =
    d1 && d2 && d1 !== d2
      ? await Promise.all([
          fetchDriverSeason(d1, season),
          fetchDriverSeason(d2, season),
        ])
      : [null, null];

  const comparison =
    seasonA && seasonB ? compareDrivers(season, seasonA, seasonB) : null;

  // Deux seuils, parce que les deux usages ne sont pas soumis aux mêmes
  // règles : les gros scores de duel sont du « grand texte » (3:1 suffit),
  // les chiffres de statistiques sont en 18 px gras, donc du texte normal
  // au sens WCAG — il leur faut 4,5:1. Red Bull (#1e41ff) plafonne à 3,02.
  const colorA = getReadableConstructorColor(seasonA?.driver.teamId ?? "");
  const colorB = getReadableConstructorColor(seasonB?.driver.teamId ?? "");
  const textColorA = getReadableConstructorColor(
    seasonA?.driver.teamId ?? "",
    4.5,
  );
  const textColorB = getReadableConstructorColor(
    seasonB?.driver.teamId ?? "",
    4.5,
  );

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-5">
              <SectionEyebrow>Tête-à-tête — Saison {season}</SectionEyebrow>
              <h1 className="text-5xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
                Comparateur
              </h1>
            </div>
            <SeasonUrlSelect value={season} triggerClassName="w-[140px] h-11" />
          </div>

          <div className="flex flex-wrap items-end gap-6">
            <DriverPicker
              param="d1"
              label="Premier pilote"
              value={d1}
              drivers={drivers}
            />
            <span className="pb-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-foreground/55">
              vs
            </span>
            <DriverPicker
              param="d2"
              label="Second pilote"
              value={d2}
              drivers={drivers}
            />
          </div>
        </div>
      </section>

      {!comparison ? (
        <section className="px-6 py-10 md:px-12">
          <p className="border border-dashed border-white/15 p-6 text-sm leading-relaxed text-foreground/55">
            {d1 && d2 && d1 === d2
              ? "Choisissez deux pilotes différents."
              : `Aucune donnée pour ces pilotes en ${season}. Ils n'ont peut-être pas couru cette saison-là.`}
          </p>
        </section>
      ) : (
        <>
          <section className="grid border-b border-border md:grid-cols-2">
            {[
              { s: seasonA!, color: colorA, side: "gauche" },
              { s: seasonB!, color: colorB, side: "droite" },
            ].map(({ s, color }) => (
              <div
                key={s.driver.id}
                className="flex flex-col gap-3 border-b border-border px-6 py-8 last:border-b-0 md:border-b-0 md:px-12 md:[&:first-child]:border-r"
              >
                <span
                  className="h-1 w-14"
                  aria-hidden
                  style={{ background: color }}
                />
                <Link
                  href={`/drivers/${s.driver.id}?season=${season}`}
                  className="text-3xl font-black italic uppercase leading-tight tracking-tight hover:opacity-80 sm:text-4xl"
                >
                  {s.driver.name} {s.driver.surname}
                </Link>
                <span className="text-sm text-foreground/55">
                  {s.driver.nationality
                    ? `${countryToFlagEmoji(s.driver.nationality)} ${s.driver.nationality}`
                    : ""}
                  {s.driver.number ? ` · nº ${s.driver.number}` : ""}
                </span>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-6 border-b border-border px-6 py-10 md:px-12">
            <SectionEyebrow>Duels directs</SectionEyebrow>
            <div className="grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2">
              {[
                { label: "En course", h: comparison.race },
                { label: "En qualification", h: comparison.qualifying },
              ].map(({ label, h }) => (
                <div
                  key={label}
                  className="flex flex-col gap-3 bg-background p-6"
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                    {label}
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span
                      className="font-mono text-4xl font-black"
                      style={{ color: colorA }}
                    >
                      {h.a}
                    </span>
                    <span className="text-foreground/55">—</span>
                    <span
                      className="font-mono text-4xl font-black"
                      style={{ color: colorB }}
                    >
                      {h.b}
                    </span>
                  </div>
                  {/* Chaîne assemblée en amont : découpée en JSX, le pluriel
                      se retrouvait séparé par une espace (« manche s »). */}
                  <span className="text-xs text-foreground/50">
                    {h.rounds > 1
                      ? `sur ${h.rounds} manches courues par les deux`
                      : `sur ${h.rounds} manche courue par les deux`}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
            <SectionEyebrow>Statistiques de la saison</SectionEyebrow>
            <ul className="flex flex-col gap-px border border-white/8 bg-white/8">
              {comparison.metrics.map((m) => {
                const max = Math.max(m.a ?? 0, m.b ?? 0, 1);
                return (
                  <li
                    key={m.key}
                    className="flex flex-wrap items-center gap-4 bg-background px-5 py-4 sm:px-6"
                  >
                    <span
                      className={`w-14 text-right font-mono text-lg font-extrabold ${m.winner === "a" ? "" : "text-foreground/55"}`}
                      style={
                        m.winner === "a" ? { color: textColorA } : undefined
                      }
                    >
                      {m.a ?? "—"}
                    </span>
                    <Bar
                      value={m.a ?? 0}
                      max={max}
                      color={colorA}
                      align="right"
                    />
                    <span className="w-[190px] shrink-0 text-center text-xs font-bold uppercase tracking-[0.12em] text-foreground/55">
                      {m.label}
                      {m.lowerIsBetter && (
                        <span className="ml-1 font-normal normal-case tracking-normal text-foreground/55">
                          (au plus bas)
                        </span>
                      )}
                    </span>
                    <Bar
                      value={m.b ?? 0}
                      max={max}
                      color={colorB}
                      align="left"
                    />
                    <span
                      className={`w-14 font-mono text-lg font-extrabold ${m.winner === "b" ? "" : "text-foreground/55"}`}
                      style={
                        m.winner === "b" ? { color: textColorB } : undefined
                      }
                    >
                      {m.b ?? "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
