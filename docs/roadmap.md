# 🛣️ Roadmap — CleanLap

CleanLap est une web app Next.js orientée F1, dont l’objectif est de fournir un dashboard clair, complet et agréable pour suivre la saison en cours.

---

## ✅ V1 — Base terminée (💪 done)

### 🏗️ Architecture & composants

- [x] Mise en place du projet avec Next.js App Router + TypeScript
- [x] Structure clean et modulaire (lib/api, entities, features, components)
- [x] Shadcn pour les composants UI (Card, Badge, etc.)
- [x] React Query pour les appels API Ergast (via Jolpi)

### 🏁 Page d’accueil (Home)

- [x] `NextRaceCard` avec countdown visuel stylé
- [x] `RaceResultsCard` avec gagnant mis en valeur + points
- [x] `UpcomingRaces` (5 prochaines courses)
- [x] `StandingsPreview` (top 5 pilotes & constructeurs)

---

## 🔜 V2 — Pages & routing

### 📍 Navigation & pages

- [ ] `Navbar` globale avec routing (mobile + desktop)
- [ ] `/standings` — Classement complet
- [ ] `/calendar` — Calendrier complet filtrable
- [ ] `/results/[round]` — Résultats complets d’une course

### 🏁 Résultats de course

- [ ] Top 10 ou liste complète avec scroll
- [ ] Tabs : Résultats / Sprint / Qualifs / Tours
- [ ] Podium visuel (top 3)

---

## 🧼 V3 — Qualité UX & UI

### 🎨 Design system

- [ ] Composant `SectionCard` réutilisable
- [ ] Mise en avant des vainqueurs, podiums, badges par statut
- [ ] Colorisation des écuries généralisée
- [ ] Accessibilité / dark mode optimisé

### 💡 UX dynamique

- [ ] Animations : Framer Motion (entrée cartes, transitions pages)
- [ ] `Live now` ou badge dynamique selon heure réelle
- [ ] Sélection de saison (2023, 2024, etc.)

---

## 🚀 V4 — Fonctionnalités avancées

### 🌍 UX enrichie

- [ ] Favoris (pilotes ou écuries)
- [ ] Stats perso (victoires, podiums, moyenne qualifs…)
- [ ] Timeline d’un week-end de course

### 🛠️ Technique

- [ ] SEO & OpenGraph complet
- [ ] Tests (unitaires & e2e)
- [ ] Proxy/cache API (si surcharge ou quota)

---

## 🧪 Idées bonus

- 🎧 Mode “Live commentary” (scroll automatique sur tours ?)
- 📱 PWA / mode mobile allégé
- 🔔 Notifications course imminente (web API ?)

---

> Cette roadmap est évolutive. Chaque bloc peut être itéré indépendamment pour livrer des versions intermédiaires.

**Clean. Typé. Stylé. 🏎️**
