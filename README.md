# 🏎️ CleanLap

Tableau de bord F1 construit avec Next.js, TypeScript et Shadcn/UI. L'app affiche en un clin d'œil la prochaine course, les résultats récents, les horaires du week-end et les classements.

---

## ✨ Fonctionnalités actuelles

- 🏗️ **Écuries** : index par saison et fiche détaillée (palmarès, classement constructeurs, effectif remplaçants compris), accessibles depuis la navigation, les classements et les fiches pilotes
- 🏟️ **Page Week-end** : les sessions du week-end en cours (essais, sprint, qualifs, course) ordonnées chronologiquement, avec leur état — terminé / en direct / à venir — et le podium de celles déjà courues
- ⏱️ Compte à rebours de la prochaine course avec infos circuit
- 🏆 Podium visuel du dernier GP sur l'accueil, puis le reste du top 6
- 🏁 Résultat de la dernière course (aperçu + page détaillée)
- 🏎️ Aperçu des qualifications du week-end courant (affichées seulement si la qualif est aujourd'hui ou demain)
- 🏎️💨 Page Résultats : onglets Course, Sprint, Qualifications, FP1, FP2, FP3
- 📊 Classements pilotes & constructeurs (top 5) + couleurs d'écurie
- ⭐ **Favoris** : marquer pilotes et écuries depuis les classements ou leur fiche, retrouvés sur l'accueil (persistés dans le navigateur)
- 🔔 Rappel avant le départ : notification opt-in, et export iCalendar (alarme à -1 h) qui fonctionne application fermée
- 🗓️ Aperçu des prochaines courses + page calendrier
- 📂 Résultats par saison/manche, pages standings et calendrier dédiées

---

## 🛠️ Stack technique

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS
- Shadcn/UI
- f1api.dev pour les données F1 (courses, résultats, standings, essais libres)
- Vitest (tests unitaires) + Playwright (smoke e2e et audit axe)
- ESLint + Prettier

---

## 🗂️ Structure rapide

- `app/` : pages et layouts (App Router)
- `components/` : composants UI (cards, tables, countdowns, previews)
- `features/` : hooks et logique d'affichage (nextRace, race results, standings, qualif, etc.)
- `entities/` : types métier (course, résultats…)
- `lib/` : appels API, helpers (couleurs, dates, flags)
- `providers/` : providers globaux (React Query, thèmes)

---

## 🚀 Démarrer

```bash
npm install
npm run dev
```

### Tests

```bash
npm test          # tests unitaires (Vitest)
npm run test:e2e  # smoke end-to-end (Playwright, sur un build de prod)
```

---

## 🧭 Roadmap

- Voir `/docs/roadmap.md`

---

## 📜 Licence

Side project communautaire basé sur des données publiques (f1api.dev). Made with ❤️ by des passionnés de F1.
