# 🗂️ Backlog CleanLap

Liste de tâches priorisées, réparties en 5 axes. Complète `roadmap.md` (qui donne la vision)
en donnant le "quoi faire concrètement, et où dans le code".

Légende effort : **S** ≈ ½ journée · **M** ≈ 1-2 jours · **L** ≈ 3 jours et +

---

## 🚀 Feature

- [ ] **Fiche circuit dédiée** — `/circuits/[circuitId]` : infos clés, record du tour, historique des vainqueurs.
      Les données sont déjà récupérées et jetées dans `fetchRaceSchedule` (`circuitDetails`, lib/api/race.ts:330) — il n'y a plus qu'à leur donner une page. **M**
- [ ] **Comparateur de pilotes** — head-to-head sur une saison (qualifs, courses, points, DNF).
      Endpoint `/api/{year}/compare/{d1}/{d2}` déjà listé dans la roadmap, `fetchDriverSeason` fournit déjà les stats par pilote. **M**
- [x] **Page « week-end en cours »** — `/weekend`, branchée sur le CTA de la home et sur les deux navigations.
      Les sessions sont triées sur leurs horaires réels, ce qui distingue tout seul un week-end sprint (FP1 → SQ → Sprint → Qualif → Course) d'un week-end classique, sans format codé en dur.
      Chaque session porte son état (terminé / en direct / à venir) et, si elle est courue, son podium. Aucun appel API n'est payé pour une session à venir.
      Horaires affichés en heure de Paris via un fuseau figé : sans ça le rendu serveur prendrait le fuseau de l'hôte, donc UTC une fois déployé sur Vercel.
      ⚠️ Les qualifs sprint sont affichées sans classement : pas d'endpoint dédié dans la couche API.
      ⚠️ `fetchRaceSchedule` expose désormais l'année de la saison — l'alias `current` marche sur `/api/current` mais renvoie 404 sur `/api/current/13/qualy`.
- [ ] **Favoris pilote / écurie** — persistance `localStorage`, épinglage en haut des classements et badge sur la home. **S**
- [ ] **Fiches écuries** — `/teams/[teamId]` : line-up par saison, palmarès, couleur de marque.
      Le mapping couleurs/noms existe déjà dans lib/utils/colors.ts. **M**
- [ ] **Notifications "course imminente"** — Web Notifications API + rappel 1h avant le départ (opt-in explicite). **M**

---

## 🎨 UI / UX

- [x] **États de chargement réels** — squelettes partagés dans `components/skeletons/PageSkeletons.tsx`, calqués sur le gabarit réel (hero, lignes, tuiles) pour que l'arrivée des données ne décale pas la page.
      Côté client, là où l'essentiel de l'attente se joue : `/calendar` n'affichait **rien** et annonçait « 0 manches » — il a désormais un squelette et des compteurs à « — » ; `/standings` passe d'un « Chargement… » nu à un squelette podium + liste ; `/drivers` passe d'un spinner posé sur une grille vide à une grille de cartes fantômes. `/results` avait déjà le sien.
      Le `.then()` sans `catch` de `/calendar` est corrigé (même classe de bug que `/results/[season]`), avec garde anti-réponse obsolète au changement de saison.
      Accessibilité : chaque squelette porte un `role="status"` avec libellé lisible, les barres sont `aria-hidden` — une page en chargement n'est plus silencieuse au lecteur d'écran.
      ⚠️ **Côté serveur, seul `/weekend` a un `loading.tsx`.** Un `loading.tsx` met la route en streaming, donc le statut HTTP part avant que la page puisse appeler `notFound()` : `/results/2024/999` repassait de 404 à **200**. Mesuré dans les quatre configurations, `generateMetadata` ne rattrape rien. `/results/[season]/[round]` et `/drivers/[driverId]` gardent donc leur statut correct et la barre `nextjs-toploader` à la place du squelette. Règle et mesures dans `components/skeletons/README.md`.
- [x] **États d'erreur et vide soignés** — la 500 sur `/results/2024/999` est corrigée : la page rend un vrai **404**.
      Cause traitée à la racine : un 404 de f1api.dev veut dire « ça n'existe pas », pas « c'est cassé ». `fetchJSONOrNull` distingue les deux, `fetchRaceResults` renvoie `null` sur une manche hors calendrier (la page appelle `notFound()`), et `fetchQualifyingResults` renvoie une liste vide sur une séance non publiée — comme le faisaient déjà le sprint et les essais. Les vraies pannes (5xx) lèvent toujours.
      Ajoutés : `app/not-found.tsx` (404 avec liens de rattrapage), `app/error.tsx` (frontière d'erreur avec bouton Réessayer et référence du digest), `app/global-error.tsx` (filet pour le layout racine). Plus un seul écran Next brut.
      `/results/[season]` sur une saison hors calendrier restait bloqué sur « Chargement… » — la promesse rejetée n'était écoutée par personne. La page a maintenant trois états distincts (chargement / vide / indisponible) et ignore les réponses obsolètes lors d'un changement de saison.
      Le `test.fail()` du smoke e2e est retiré : le cas est devenu un test vert, accompagné de deux autres (URL inconnue, saison hors calendrier).
- [ ] **Badges de date lisibles en dark mode** — `getTimeUntilLabel` (lib/utils/date.ts:11) renvoie des classes claires en dur (`bg-blue-100 text-blue-800`) alors que le thème est sombre.
      À noter : la fonction n'a **aucun appelant** aujourd'hui. Soit on la branche sur le calendrier en la passant sur les tokens du design system, soit on la supprime. **S**
- [ ] **Faire de la place au week-end dans la nav mobile** — `/weekend` est dans la nav d'en-tête et sur le CTA de la home, mais pas dans la `BottomNav` : à 320 px, six libellés ne tiennent qu'en descendant la typo à 9 px (mesuré : 361 px de contenu pour 320 px de large). Piste : n'afficher le libellé que sur l'onglet actif, façon Material 3. **S**
- [ ] **Accessibilité** — 1 seul `aria-label` dans tout le projet. À traiter : `<caption>`/`scope` sur les tableaux de résultats, focus visible, contraste des `text-foreground/45`, `aria-live` sur le compte à rebours, info d'écurie pas véhiculée uniquement par la couleur. **M**
- [ ] **Saison dans l'URL** — `/standings`, `/results`, `/calendar` gardent la saison dans un `useState` (app/standings/page.tsx:12) : impossible de partager un lien vers 2021, et pas de retour arrière navigateur. Passer en `searchParams`. **S**
- [ ] **Animations d'entrée** — `motion` est installé mais jamais importé. Transitions de page + apparition des lignes de classement, avec respect de `prefers-reduced-motion`. **S**
- [ ] **Podium visuel du dernier GP** — la home liste le top 6 à plat (`lastRacePodium`, app/page.tsx:70) ; un vrai bloc podium ferait le job. **S**

---

## 🔧 Tech

- [ ] **Validation runtime des réponses API (zod)** — 20 `: any` restants, tous dans `lib/api/`. Un changement de shape côté f1api.dev passe inaperçu et se transforme en `"N/A"` silencieux.
      ⚠️ Devenu plus urgent : le PR #40 a désactivé `@typescript-eslint/no-explicit-any` dans `eslint.config.mjs`, donc plus rien ne signale ces `any`. Les tests des mappers couvrent maintenant les formes connues de l'API, mais pas les dérives futures. **M**
- [ ] **Route handlers proxy `/api/*`** — les hooks React Query (`useDrivers`, `useDriverSeason`, `useSeasonProgress`) tapent f1api.dev **depuis le navigateur** : pas de cache serveur, pas de contrôle du quota, latence complète visible par l'utilisateur. **M**
- [x] **Tests unitaires (Vitest)** — 65 tests, 7 fichiers, ~250 ms : `lib/utils/time`, `lib/utils/date`, `lib/utils/colors`, `lib/utils/flags`, et les mappers `lib/api/race`, `lib/api/drivers`, `lib/api/standings` (fetch bouchonné sur les fixtures de `docs/api/`).
      Validés par mutation : en réintroduisant les anciennes implémentations de `isPastRace` et `parseLapTimeMs`, 13 tests tombent — ils gardent bien les bugs corrigés, ils ne décrivent pas seulement le code actuel.
      `npm test` / `npm run test:watch`, branché dans la CI.
- [x] **Smoke e2e (Playwright)** — 10 tests dans `e2e/smoke.spec.ts`, joués contre un **build de production** (`npm run build && npm run start`), donc sur ce qui est réellement déployé.
      Couvre : les 5 routes en 200 avec leur `h1`, la navigation globale, le classement complet d'une manche passée, l'onglet Qualifications, et **zéro erreur console/`pageerror` sur chaque page**.
      Ce dernier point est vérifié par mutation : en réintroduisant l'ancien `HeroCountdown`, le test tombe sur `Minified React error #418` (mismatch d'hydratation). Les tests unitaires ne peuvent pas attraper ça.
      Job CI séparé, pour qu'un hoquet de f1api.dev ne masque pas le signal lint/types/build.
      ⚠️ Limite assumée : les pages qui chargent leurs données côté client (`/results`, `/calendar`, `/drivers`) ne sont vérifiées que sur leur coquille rendue, pas sur le contenu asynchrone.
- [ ] **Durcir la CI** — étape `npm test` ajoutée. Restent : la CI ne lance toujours pas `eslint`, utilise `npm install` (pas `npm ci`), `actions/checkout@v3` et Node 20. Ajouter le lint, épingler Node 22, passer en `npm ci`. **S**
- [ ] **Un seul lockfile** — `package-lock.json` versionné + `yarn.lock` non versionné à la racine : à trancher avant que les deux divergent. **S**
- [ ] **SEO / OpenGraph par page** — aucun `generateMetadata`, pas de `sitemap.ts`, pas de `robots.ts`, pas d'image OG dynamique. Toutes les pages s'appellent "CleanLap". **M**
- [ ] **`generateStaticParams` sur les saisons passées** — les saisons closes sont immuables : elles peuvent être pré-rendues au build au lieu d'être calculées à la demande. **S**

---

## 🐛 Refacto / Bugfix

- [x] **Parsing des temps au tour** — `fastest()` faisait `Number("1:13.040".replace(/[:.]/g, ""))`, avec cinq copies de cette logique (2 dans `lib/api/race.ts`, 3 dans `lib/config/columns.tsx`).
      Remplacé par [`parseLapTimeMs`](lib/utils/time.ts), qui convertit en millisecondes et gère les deux formats de l'API : `"1:29:909"` en qualif (millièmes après un `:`) et `"1:13.040"` en course/EL.
      ⚠️ Sur les données actuelles l'ancien code donnait le **bon ordre par chance** : il ne cassait que sur des chaînes de longueur variable (`"1:13.04"` devenait 11304, donc "plus rapide" que tout le monde). Correction préventive, pas de régression visible corrigée.
- [x] **Détection de la prochaine course** — la home déduisait la manche de `races.filter(isPastRace).length`, ce qui supposait le tri chronologique du tableau **et** que l'index valait le numéro de manche.
      Désormais : tri explicite sur l'horaire, `findIndex` sur la première course non terminée, et numéro de manche pris sur le champ `round` de l'API. Le champ `round` a été ajouté au type `Race`.
- [x] **`isPastRace` ignorait l'heure** — `new Date("2026-09-06")` = minuit UTC, donc un GP courant à 15 h était marqué "passé" pendant toute la journée. `isPastRace(date, time)` prend maintenant l'heure, et retombe sur la fin de journée quand l'API ne la fournit pas. Corrigé aussi dans `useSeasonProgress`.
- [x] **Mismatch d'hydratation du countdown** — reproduit puis vérifié : ancienne version = `Hydration failed because the server rendered text…` dans la console, nouvelle version = 0 erreur sur 5 chargements en onglet neuf. Premier rendu neutre (`--`), décompte démarré dans `useEffect`.
- [x] **`bestTimes` recopié sur chaque ligne** — supprimé. La couche API expose `isFastestQ1/Q2/Q3`, et les colonnes ne re-parsent plus de chaînes de temps.
- [x] **Typage de `ResultTable`** — `data: any[]` remplacé par un type mappé `ResultColumn<T>` qui lie `key` au type de `value`. Les quatre configs de colonnes sont annotées (`RaceResult`, `QualifyingResult`, `FreePracticeResult`, `SprintResult`, ce dernier extrait de `fetchSprintResults`).
- [x] **`@f1api/sdk` retiré** — dépendance jamais importée, supprimée de `package.json` et du lockfile.
- [x] **`any` restants hors couche API** — props `params`/`searchParams` des pages dynamiques typées, `driver: any` supprimé dans `DriversPageClient`.
- [ ] **Factoriser les 4 `fetchJSON`** — non fait : quatre implémentations quasi identiques (race.ts, results.ts, drivers.ts, standings.ts) avec des politiques de cache incohérentes. À traiter avec l'item « étendre la stratégie de cache », sinon on refactorise deux fois. **M**

> ~~Position de qualif = `gridPosition`~~ — **point erroné de la première liste.** Vérification faite sur `docs/api/qualy_results.json` : sur l'endpoint qualif, `gridPosition` est bien le classement de la séance (ordonné par Q3 puis Q2 puis Q1), et `classificationId` n'est qu'un identifiant d'enregistrement. Il n'y a pas de meilleur champ à utiliser. Un commentaire a été ajouté dans le code pour éviter qu'on repose la question.

## ⚡ Optimisation

- [ ] **36 appels API pour une page de la liste des saisons** — `fetchSeasonDetailsPage` (lib/api/results.ts:151) fait 3 requêtes × 12 saisons en parallèle sur une API à ~4-5 s. Récupérer le champion depuis la réponse saison quand il est présent, et ne retomber sur les endpoints championnat qu'en dernier recours. **M**
- [ ] **Étendre la stratégie de cache aux appels non cachés** — `fetchDriverStandings`, `fetchConstructorStandings` et `fetchDrivers` appellent `fetch()` sans aucune option, donc sans mise en cache. La logique `isLiveSeason` / `cacheOptions` de race.ts:60 devrait s'appliquer partout. **S**
- [ ] **`useSeasonProgress` dans le header** — le `SiteHeader` (components/layout/SiteHeader.tsx:19) déclenche un fetch client du calendrier complet **sur chaque page**, juste pour afficher `R5/24`. À remonter côté serveur dans le layout. **S**
- [ ] **Pause du countdown hors écran** — l'interval 1 s de `HeroCountdown` tourne même onglet en arrière-plan. Couper sur `visibilitychange`. **S**
- [ ] **Réduire le JS client** — `app/standings/page.tsx`, `app/results/page.tsx` et `app/results/[season]/page.tsx` sont entièrement `"use client"` pour un simple sélecteur de saison. Isoler le composant interactif et laisser le reste en Server Component. **M**
- [ ] **Poids des polices** — `Archivo` est chargé avec 6 graisses × normal + italic = 12 fichiers (app/layout.tsx:9). Vérifier lesquelles servent réellement. **S**

---

## 🎯 Suggestion d'ordre d'attaque

1. Le lot **S** de bugfix (parsing des temps, prochaine course, hydratation) — petits, à fort impact sur la justesse affichée.
2. **Loading / error states** — c'est ce qui se voit le plus vu la lenteur de l'API.
3. **Cache manquant + `useSeasonProgress`** — gain de perf immédiat pour un effort minime.
4. Puis les features, sur une base saine.
