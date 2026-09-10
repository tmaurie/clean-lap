"use client";

import { useEffect, useState } from "react";

import {
  REMINDER_MINUTES,
  readReminder,
  reminderMessage,
  reminderState,
  writeReminder,
} from "@/lib/notifications/raceReminder";

type Permission = "unsupported" | "default" | "granted" | "denied";

/** Un tour toutes les 30 s suffit : la fenêtre de déclenchement dure une heure. */
const TICK_MS = 30_000;

/**
 * Rappel avant le départ, et export vers l'agenda.
 *
 * ⚠️ Limite assumée et affichée à l'utilisateur : une notification web
 * programmée depuis une page ne survit pas à la fermeture de l'onglet. Sans
 * service worker, clés VAPID, stockage des abonnements et tâche planifiée
 * côté serveur, il n'existe pas de moyen de prévenir quelqu'un qui a fermé le
 * site. D'où le second bouton : l'agenda du téléphone, lui, porte l'alarme.
 */
export function RaceReminder({
  raceName,
  raceKey,
  raceStartsAtIso,
  calendarHref,
}: {
  raceName: string;
  /** Identifie la manche, pour ne pas prévenir deux fois pour la même. */
  raceKey: string;
  /** Départ de la course. Absent si le planning n'est pas publié. */
  raceStartsAtIso?: string;
  calendarHref: string;
}) {
  const [permission, setPermission] = useState<Permission>("default");
  const [enabled, setEnabled] = useState(false);
  const [dejaDansLaFenetre, setDejaDansLaFenetre] = useState(false);
  // Le serveur ne connaît ni la permission ni le stockage local : on ne rend
  // la partie notification qu'une fois monté, sinon l'hydratation diverge.
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    setMonte(true);
    setPermission(
      typeof window !== "undefined" && "Notification" in window
        ? (Notification.permission as Permission)
        : "unsupported",
    );
    setEnabled(readReminder().enabled);
  }, []);

  useEffect(() => {
    if (!enabled || permission !== "granted" || !raceStartsAtIso) return;

    const startsAt = new Date(raceStartsAtIso);
    if (Number.isNaN(startsAt.getTime())) return;

    const verifier = () => {
      const etat = reminderState(new Date(), startsAt);
      if (etat !== "a-declencher") return;
      if (readReminder().lastFired === raceKey) return;

      const { title, body } = reminderMessage(raceName);
      // `tag` : deux onglets ouverts ne doivent pas empiler deux notifications.
      new Notification(title, { body, tag: `cleanlap-${raceKey}` });
      writeReminder({ enabled: true, lastFired: raceKey });
    };

    verifier();
    // Volontairement **pas** suspendu sur `visibilitychange`, contrairement au
    // compte à rebours : c'est justement en arrière-plan que ce rappel sert.
    const timer = window.setInterval(verifier, TICK_MS);
    return () => window.clearInterval(timer);
  }, [enabled, permission, raceStartsAtIso, raceKey, raceName]);

  const activer = async () => {
    if (permission === "unsupported") return;

    const accord =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    setPermission(accord as Permission);
    if (accord !== "granted") return;

    // Si le départ est déjà dans moins d'une heure, on n'envoie pas une
    // notification dans la seconde qui suit le clic : on le dit, et le rappel
    // vaudra pour la manche suivante.
    const startsAt = raceStartsAtIso ? new Date(raceStartsAtIso) : null;
    const dedans =
      startsAt !== null &&
      !Number.isNaN(startsAt.getTime()) &&
      reminderState(new Date(), startsAt) !== "trop-tot";

    setDejaDansLaFenetre(dedans);
    setEnabled(true);
    writeReminder({ enabled: true, lastFired: dedans ? raceKey : null });
  };

  const desactiver = () => {
    setEnabled(false);
    setDejaDansLaFenetre(false);
    writeReminder({ enabled: false, lastFired: null });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <a
          href={calendarHref}
          className="inline-flex h-11 items-center border border-white/20 px-6 text-xs font-bold uppercase tracking-[0.1em] transition-colors hover:border-white/50"
        >
          Ajouter le week-end à mon agenda
        </a>

        {monte && permission !== "unsupported" && permission !== "denied" && (
          <button
            type="button"
            onClick={enabled ? desactiver : activer}
            aria-pressed={enabled}
            className="inline-flex h-11 items-center border border-white/20 px-6 text-xs font-bold uppercase tracking-[0.1em] transition-colors hover:border-white/50"
          >
            {enabled
              ? "Désactiver le rappel"
              : `Me prévenir ${REMINDER_MINUTES} min avant`}
          </button>
        )}
      </div>

      <p className="max-w-2xl text-xs leading-relaxed text-foreground/55">
        {monte && permission === "denied" ? (
          <>
            Les notifications sont bloquées pour ce site dans les réglages du
            navigateur. L&apos;export agenda, lui, fonctionne :{" "}
            <strong className="font-semibold text-foreground/70">
              il pose une alarme {REMINDER_MINUTES} minutes avant chaque session
            </strong>
            , même application fermée.
          </>
        ) : monte && permission === "unsupported" ? (
          <>
            Ce navigateur ne gère pas les notifications web. L&apos;export
            agenda pose une alarme {REMINDER_MINUTES} minutes avant chaque
            session, même application fermée.
          </>
        ) : dejaDansLaFenetre ? (
          <>
            Le départ est dans moins d&apos;une heure : le rappel s&apos;
            appliquera à la manche suivante. Pour être prévenu maintenant,
            ajoutez le week-end à votre agenda.
          </>
        ) : enabled ? (
          <>
            Rappel actif —{" "}
            <strong className="font-semibold text-foreground/70">
              uniquement si un onglet CleanLap reste ouvert
            </strong>
            . Une notification programmée depuis une page ne survit pas à sa
            fermeture. Pour un rappel qui tient dans tous les cas, ajoutez le
            week-end à votre agenda.
          </>
        ) : (
          <>
            L&apos;export agenda pose une alarme {REMINDER_MINUTES} minutes
            avant chaque session et fonctionne application fermée. La
            notification, elle, ne se déclenche que si un onglet CleanLap reste
            ouvert.
          </>
        )}
      </p>
    </div>
  );
}
