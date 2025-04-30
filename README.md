# 🏎️ CleanLap

**CleanLap** est une web app dédiée à la F1, construite avec Next.js, TypeScript et Shadcn/UI.  
Elle fournit en un clin d'œil toutes les informations essentielles : prochaine course, résultats récents, calendrier et classements.

---

## ✨ Fonctionnalités principales

- 🔥 **Compte à rebours vers la prochaine course**
- 🏁 **Résultats de la dernière course**
- 📆 **Liste des prochaines courses à venir**
- 📊 **Classement pilotes & constructeurs (top 5)**
- 🏆 **Historique des résultats de la saison en cours et des saisons précédentes**

---

## 🧱 Tech Stack

- **Next.js 15** pour le rendu côté serveur et la génération de pages statiques
- **TypeScript** pour la sécurité des types
- **React 19** pour la construction d'interfaces utilisateur
- **Shadcn/UI** pour les composants UI réutilisables
- **React Query** (`@tanstack/react-query`) pour la gestion des données distantes
- **Ergast API (via Jolpica)** pour les données F1 (courses, standings, résultats)
- **Tailwind CSS** pour le style rapide et cohérent
- **ESLint** et **Prettier** pour le linting et le formatage du code

## 🚀 Démarrer le projet

```bash
npm install
npm dev
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

---

## 🚧 Roadmap

> 📌 [Voir la version complète dans `/docs/roadmap.md`](./docs/roadmap.md)

---

## 📜 License

Ce projet est un side project à but pédagogique et communautaire, basé sur des données publiques.

Made with 💻 and 🏁 by a passionate dev & F1 fan.
