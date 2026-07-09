import { RaceResult } from "@/entities/race/model";
import { getConstructorColor } from "@/lib/utils/colors";
import { GhostNumber } from "@/components/paddock/GhostNumber";

type Props = {
  results: RaceResult[];
};

export function PodiumBlock({ results }: Props) {
  const podium = results.slice(0, 3);

  if (podium.length < 3) return null;

  return (
    <>
      {podium.map((result, index) => {
        const teamColor = getConstructorColor(result.constructor);
        const parts = result.driver.trim().split(" ");
        const lastName = parts.at(-1) ?? result.driver;
        const firstName = parts.slice(0, -1).join(" ");
        const isWinner = index === 0;

        return (
          <div
            key={result.driver}
            className="relative flex flex-col gap-4 overflow-hidden p-9"
            style={{
              background: isWinner ? "#12151a" : "var(--background)",
              borderRight: index < 2 ? "1px solid var(--border)" : undefined,
            }}
          >
            <span
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: teamColor }}
            />
            <GhostNumber className="-bottom-6 -right-3 text-[160px]">
              {index + 1}
            </GhostNumber>
            <div className="relative flex items-center justify-between">
              <span
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{
                  color: isWinner ? "var(--primary)" : "rgba(244,244,242,0.5)",
                }}
              >
                P{index + 1}
              </span>
              {isWinner && (
                <span className="bg-primary px-3 py-[5px] text-[11px] font-extrabold italic uppercase tracking-[0.1em] text-primary-foreground">
                  Vainqueur
                </span>
              )}
            </div>
            <div className="relative flex flex-col gap-1">
              {firstName && (
                <span className="text-[15px] text-foreground/60">
                  {firstName}
                </span>
              )}
              <span className="text-3xl font-black italic uppercase leading-none tracking-tight">
                {lastName}
              </span>
              <span className="mt-1.5 flex items-center gap-2 text-[13px] text-foreground/50">
                <span
                  className="h-2.5 w-2.5"
                  style={{ background: teamColor }}
                />
                {result.constructor}
              </span>
            </div>
            <div className="relative flex items-baseline justify-between">
              <span className="font-mono text-[15px] text-foreground/75">
                {result.time}
              </span>
              <span className="text-2xl font-extrabold">
                {result.points}{" "}
                <span className="text-[11px] font-semibold text-foreground/50">
                  PTS
                </span>
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}
