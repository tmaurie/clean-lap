/** Rappel demandé par l'item : une heure avant le départ. */
export const REMINDER_MINUTES = 60;

const STORAGE_KEY = "cleanlap.reminder.v1";

export type ReminderState = {
  enabled: boolean;
  /** Clé de la manche déjà notifiée, pour ne pas prévenir deux fois. */
  lastFired: string | null;
};

const DEFAULT_STATE: ReminderState = { enabled: false, lastFired: null };

/**
 * Position de l'instant présent par rapport au rappel.
 *
 * - `trop-tot` : le départ est à plus d'une heure ;
 * - `a-declencher` : on est dans l'heure qui précède le départ ;
 * - `depasse` : la course est partie.
 *
 * La fenêtre `a-declencher` dure une heure pleine, et non un instant : dans un
 * onglet en arrière-plan, le navigateur ralentit les minuteries à environ un
 * tour par minute. Viser une seconde précise raterait le rappel.
 */
export function reminderState(
  now: Date,
  startsAt: Date,
  minutesBefore: number = REMINDER_MINUTES,
): "trop-tot" | "a-declencher" | "depasse" {
  const depart = startsAt.getTime();
  const seuil = depart - minutesBefore * 60_000;
  const maintenant = now.getTime();

  if (maintenant >= depart) return "depasse";
  if (maintenant >= seuil) return "a-declencher";
  return "trop-tot";
}

/** Ex. « Départ dans 1 heure — Grand Prix d'Italie ». */
export function reminderMessage(raceName: string): {
  title: string;
  body: string;
} {
  return {
    title: "La course approche",
    body: `${raceName} — départ dans moins d'une heure.`,
  };
}

export function readReminder(): ReminderState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_STATE;

    const { enabled, lastFired } = parsed as Partial<ReminderState>;
    return {
      enabled: enabled === true,
      lastFired: typeof lastFired === "string" ? lastFired : null,
    };
  } catch {
    // Mode privé, quota, contenu corrompu : on repart de l'état par défaut
    // plutôt que de casser la page.
    return DEFAULT_STATE;
  }
}

export function writeReminder(state: ReminderState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // L'écriture peut être refusée ; l'état en mémoire reste valable pour la
    // session en cours.
  }
}
