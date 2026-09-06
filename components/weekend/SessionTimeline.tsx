import { clsx } from "clsx";

import { WeekendSessionView } from "@/features/weekend/getWeekend";
import { getConstructorColor } from "@/lib/utils/colors";
import { formatSessionDay, formatSessionTime } from "@/lib/utils/date";
import { SessionStatus } from "@/lib/utils/session";

const STATUS_LABEL: Record<SessionStatus, string> = {
  done: "Terminé",
  live: "En direct",
  upcoming: "À venir",
};

function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em]",
        status === "live" && "border-primary/50 bg-primary/10 text-primary",
        status === "done" && "border-white/10 text-foreground/55",
        status === "upcoming" && "border-white/15 text-foreground/70",
      )}
    >
      {status === "live" && (
        <span className="h-[6px] w-[6px] animate-blink rounded-full bg-primary" />
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}

function SessionPodium({ session }: { session: WeekendSessionView }) {
  return (
    <ol className="flex flex-col border-t border-white/8">
      {session.podium.map((entry) => (
        <li
          key={`${session.key}-${entry.position}-${entry.driver}`}
          className="flex items-center gap-4 px-5 py-2.5 sm:px-6"
        >
          <span
            className={clsx(
              "w-5 shrink-0 font-mono text-sm font-bold",
              entry.position === "1" ? "text-primary" : "text-foreground/40",
            )}
          >
            {entry.position}
          </span>
          <span
            className="h-5 w-[3px] shrink-0"
            aria-hidden
            style={{ background: getConstructorColor(entry.constructor) }}
          />
          <span className="flex-1 truncate text-[13px] font-bold uppercase tracking-wide">
            {entry.driver}
          </span>
          <span className="hidden truncate text-xs text-foreground/55 sm:block">
            {entry.constructor}
          </span>
          <span className="w-20 shrink-0 text-right font-mono text-xs text-foreground/70">
            {entry.detail}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function SessionTimeline({
  sessions,
}: {
  sessions: WeekendSessionView[];
}) {
  if (sessions.length === 0) {
    return (
      <p className="border border-dashed border-white/15 p-6 text-sm text-foreground/50">
        Le planning de ce week-end n&apos;est pas encore publié.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-px bg-white/8">
      {sessions.map((session) => (
        <li
          key={session.key}
          className={clsx(
            "bg-background",
            session.status === "live" && "border-l-2 border-primary",
          )}
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 sm:px-6">
            <span
              className={clsx(
                "w-16 shrink-0 font-mono text-sm font-bold uppercase tracking-[0.1em]",
                session.status === "live"
                  ? "text-primary"
                  : session.status === "done"
                    ? "text-foreground/40"
                    : "text-foreground",
              )}
            >
              {session.shortLabel}
            </span>

            <span
              className={clsx(
                "min-w-[150px] flex-1 text-sm font-semibold uppercase tracking-wide",
                session.status === "done" && "text-foreground/50",
              )}
            >
              {session.label}
            </span>

            <time
              dateTime={session.startsAt.toISOString()}
              className="font-mono text-[13px] text-foreground/70"
            >
              {formatSessionDay(session.startsAt)}{" "}
              <span className="text-foreground">
                {formatSessionTime(session.startsAt)}
              </span>
            </time>

            <StatusBadge status={session.status} />
          </div>

          {session.podium.length > 0 && <SessionPodium session={session} />}
        </li>
      ))}
    </ol>
  );
}
