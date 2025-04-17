# 🏎️ CleanLap

**CleanLap** est une web app dédiée à la F1, construite avec Next.js, TypeScript et Shadcn/UI.  
Elle fournit en un clin d'œil toutes les informations essentielles : prochaine course, résultats récents, calendrier et classements.

---

## ✨ Fonctionnalités principales

- 🔥 **Compte à rebours vers la prochaine course**
- 🏁 **Résultats de la dernière course**
- 📆 **Liste des prochaines courses à venir**
- 📊 **Classement pilotes & constructeurs (top 5)**

Le tout dans un layout **responsive, accessible et agréable à consulter**, même sur mobile.

---

## 🧱 Tech Stack

- **Next.js 14 App Router** + TypeScript
- **Shadcn/UI** pour les composants UI réutilisables
- **React Query** (`@tanstack/react-query`) pour la gestion des données distantes
- **Ergast API (via Jolpi)** pour les données F1 (courses, standings, résultats)
- **Tailwind CSS** pour le style rapide et cohérent
- **Architecture Clean & Typée** (lib/api, entities, features, components...)

---

## 🚧 Roadmap

> 📌 [Voir la version complète dans `/docs/roadmap.md`](./docs/roadmap.md)

### V1 – ✅ Terminé

- Page d'accueil avec layout bento :
  - `NextRaceCard`
  - `RaceResultsCard`
  - `UpcomingRaces`
  - `StandingsPreview`

### V2 – À venir

- ✅ Routing complet avec pages :
  - `/standings`
  - `/results/[round]`
  - `/calendar`
- ✅ Affichage détaillé des classements
- ✅ Résultats complets d’une course

### V3 – Améliorations UI/UX

- ✅ Animations (Framer Motion)
- ✅ Dark/Light toggle
- ✅ Réutilisation de composants type `SectionCard`

---

## 🚀 Démarrer le projet

```bash
pnpm install
pnpm dev
```

Architecture de fichiers :

```bash
src/
├── app/                  # App Router (pages, layout)
├── components/           # UI components (Card, Countdown, etc.)
├── features/             # Hooks React + logique liée à l'affichage
├── entities/             # Types & logique métier pure
├── lib/
│   ├── api/              # Appels API externes (jolpica (Ergast API))
│   └── ui/               # Helpers visuels (ex: getConstructorColor)
├── providers/            # Contexts globaux (theme, query)
├── styles/               # Tailwind config & global CSS
└── public/               # Assets statiques
```

## 📜 License

Ce projet est un side project à but pédagogique et communautaire, basé sur des données publiques.

Made with 💻 and 🏁 by a passionate dev & F1 fan.
