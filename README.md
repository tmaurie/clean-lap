# 🏎️ CleanLap

Tableau de bord F1 construit avec Next.js, TypeScript et Shadcn/UI. L'app affiche en un clin d'œil la prochaine course, les résultats récents, les horaires du week-end et les classements.

---

## ✨ Fonctionnalités actuelles

- ⏱️ Compte à rebours de la prochaine course avec infos circuit
- 🏁 Résultat de la dernière course (aperçu + page détaillée)
- 🏎️ Aperçu des qualifications du week-end courant (affichées seulement si la qualif est aujourd'hui ou demain)
- 🏎️💨 Page Résultats : onglets Course, Sprint, Qualifications, FP1, FP2, FP3
- 📊 Classements pilotes & constructeurs (top 5) + couleurs d'écurie
- 🗓️ Aperçu des prochaines courses + page calendrier
- 📂 Résultats par saison/manche, pages standings et calendrier dédiées

---

## 🛠️ Stack technique

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS
- Shadcn/UI
- React Query (`@tanstack/react-query`)
- f1api.dev pour les données F1 (courses, résultats, standings, essais libres)
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

---

## 🧭 Roadmap

- Voir `/docs/roadmap.md`

---

## 📜 Licence

Side project communautaire basé sur des données publiques (f1api.dev). Made with ❤️ by des passionnés de F1.
