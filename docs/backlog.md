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
- [ ] **Saison dans l'URL — reste `/calendar`** — `/standings` et `/drivers` sont passés par `?season=` avec la conversion en Server Components. `/calendar` garde un `useState`, donc pas de lien partageable ni de retour arrière. **S**
- [ ] **Animations d'entrée** — `motion` est installé mais jamais importé. Transitions de page + apparition des lignes de classement, avec respect de `prefers-reduced-motion`. **S**
- [ ] **Podium visuel du dernier GP** — la home liste le top 6 à plat (`lastRacePodium`, app/page.tsx:70) ; un vrai bloc podium ferait le job. **S**

---

## 🔧 Tech

- [x] **Couche API typée (sans zod)** — `lib/api/types.ts` décrit les réponses de f1api.dev d'après les fixtures réelles de `docs/api/`, incohérences comprises (`circuit` objet **ou** tableau, champs numériques en `number | string`, `"NC"` et `"not available"`, `firstAppareance` avec sa faute de frappe côté API, noms de circuit différents sur l'endpoint pilote-saison).
      **30 `any` → 0** dans `lib/api/`, et la règle `@typescript-eslint/no-explicit-any` est réactivée sur ce périmètre (elle avait été désactivée globalement par le PR #40) pour que ça le reste.
      Vérifié par mutation : `r.fastLap` → `r.fastlap` et `driver.nationality` → `driver.nationalite` sont tous deux rejetés à la compilation, avec suggestion de correction.

      Le typage a révélé **cinq défauts latents**, corrigés :
      1. `mapRace`, `fetchRaceSchedule` et `fetchRacesWithWinner` lisaient `circuit.circuitName` sans normaliser la forme tableau — ils auraient lu `undefined` sur les endpoints qui la renvoient. Normaliseur partagé (`normalizeCircuit`).
      2. `fetchFreePracticeResults` retombait sur `json.races`, c'est-à-dire l'**objet** manche, passé ensuite à `.map()` : ça aurait levé.
      3. `mapDriverRaceResults` empilait une dizaine de replis inatteignables (`r.score`, `r.startingGrid`, `raceData.race.name`…). Réécrit sur la forme réelle : les 12 tests pilotes passent à l'identique, ce qui confirme qu'ils ne servaient à rien.
      4. `fetchDriverSeason` avait deux replis morts (`json.driver?.[0]`, `json.driverRaces`).
      5. Plusieurs champs pouvaient valoir `undefined` alors que le modèle promet `string` — l'interface aurait affiché « undefined ». Valeurs de repli ajoutées.

      ⚠️ Choix assumé : pas de zod. Les types attrapent les erreurs de code à la compilation, ce qui est le risque quotidien ; ils ne voient pas une dérive de l'API à l'exécution. Si f1api.dev change de forme, ce sont les tests (sur fixtures) et l'affichage qui le diront. zod reste une option si la détection runtime devient utile.

- [ ] **Route handlers proxy `/api/*`** — périmètre nettement réduit depuis le passage en Server Components : `/standings`, `/drivers` et `/results/[season]` ne tapent plus l'API depuis le navigateur. Il ne reste que `/calendar` et la liste `/results` (défilement infini). **S**
- [x] **Tests unitaires (Vitest)** — 65 tests, 7 fichiers, ~250 ms : `lib/utils/time`, `lib/utils/date`, `lib/utils/colors`, `lib/utils/flags`, et les mappers `lib/api/race`, `lib/api/drivers`, `lib/api/standings` (fetch bouchonné sur les fixtures de `docs/api/`).
      Validés par mutation : en réintroduisant les anciennes implémentations de `isPastRace` et `parseLapTimeMs`, 13 tests tombent — ils gardent bien les bugs corrigés, ils ne décrivent pas seulement le code actuel.
      `npm test` / `npm run test:watch`, branché dans la CI.
- [x] **Smoke e2e (Playwright)** — 10 tests dans `e2e/smoke.spec.ts`, joués contre un **build de production** (`npm run build && npm run start`), donc sur ce qui est réellement déployé.
      Couvre : les 5 routes en 200 avec leur `h1`, la navigation globale, le classement complet d'une manche passée, l'onglet Qualifications, et **zéro erreur console/`pageerror` sur chaque page**.
      Ce dernier point est vérifié par mutation : en réintroduisant l'ancien `HeroCountdown`, le test tombe sur `Minified React error #418` (mismatch d'hydratation). Les tests unitaires ne peuvent pas attraper ça.
      Job CI séparé, pour qu'un hoquet de f1api.dev ne masque pas le signal lint/types/build.
      ⚠️ Limite assumée : les pages qui chargent leurs données côté client (`/results`, `/calendar`, `/drivers`) ne sont vérifiées que sur leur coquille rendue, pas sur le contenu asynchrone.
- [x] **CI durcie** — `npm ci` au lieu de `npm install` (échoue si le lockfile a divergé, là où `npm install` le réécrivait), étape `npm run lint` ajoutée, Node épinglé à 22 via une variable de workflow, `actions/checkout` et `setup-node` en v4, et annulation des runs concurrents sur une même branche.
- [x] **Un seul lockfile** — `yarn.lock` supprimé, le projet reste sur `package-lock.json`. Il n'avait jamais été commité et avait déjà divergé : **161 entrées contre 616**, soit un état antérieur à l'ajout de Vitest et Playwright et au retrait de React Query et `@f1api/sdk`.
      Garde-fou : `yarn.lock`, `pnpm-lock.yaml` et `bun.lockb` sont ignorés par git, et `engines.node >= 22` dans `package.json` s'aligne sur la version épinglée en CI. `npm ci` échoue déjà si le lockfile diverge de `package.json`.
- [x] **SEO — titres, sitemap, robots** — `app/sitemap.ts` (16 URL : pages fixes + 10 dernières saisons) et `app/robots.ts`, `metadataBase` sur le layout racine (sans elle Next avertit au build et émet des URL OpenGraph cassées), et un titre propre par page : toutes s'appelaient « CleanLap ».
      Un test e2e vérifie que les cinq pages principales ont des titres **tous distincts**.
      ⚠️ Reste à faire : l'image OpenGraph dynamique (`opengraph-image.tsx` via `next/og`). **S**
- [x] **`generateStaticParams` sur `/results/[season]`** — la page était un composant client (fetch dans un `useEffect`) : le pré-rendu n'aurait rien apporté, elle est donc d'abord passée en Server Component.
      Les cinq dernières saisons sont pré-rendues au build ; les autres restent générées à la demande, pour ne pas payer au build les ~4-5 s de f1api.dev × 77 saisons. Mesuré : **1,8 ms** pour une saison pré-rendue contre ~12 ms en dynamique.
      Une année hors du calendrier F1 rend désormais un vrai **404** au lieu d'un état vide.
      ⚠️ Pas de `generateStaticParams` sur `/results/[season]/[round]` : chaque page coûte 8 appels API, pré-rendre ne serait-ce que 10 manches ajouterait ~2 min au build pour un gain nul une fois le cache chaud.

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
- [x] **Factoriser les 4 `fetchJSON`** — fait avec le lot optimisations : `lib/api/client.ts` remplace les quatre implémentations et porte les politiques de cache.
- [x] **Cache étendu à toute la couche API** — les quatre implémentations de `fetchJSON` sont remplacées par `lib/api/client.ts`, avec trois politiques selon la volatilité : saison en cours 60 s, saison passée jamais revalidée, donnée de référence 1 h.
      `fetchDriverStandings`, `fetchConstructorStandings` et `fetchDrivers` n'avaient **aucune** option de cache. Mesuré sur `/standings?season=2019` en production : **4,9 s au premier appel, 0,014 s ensuite**.
- [x] **Payload de la liste des saisons** — `?limit=1` sur les deux endpoints championnat : la page n'affiche que le champion, elle recevait le classement complet. **11,8 Ko → 0,7 Ko** par saison et par championnat (~283 Ko → ~17 Ko pour une page de 12).
      ⚠️ Deux hypothèses de la version initiale de cet item étaient fausses, vérifiées à la mesure : le champion n'est **pas** dans la réponse `/api/{season}` (seulement `championshipId`, `championshipName`, `url`, `year`), et limiter la concurrence dégrade tout — 36 requêtes simultanées prennent **6,0 s**, par lots de 6 elles prennent **26,6 s**. La parallélisation actuelle est la bonne.
- [x] **`useSeasonProgress` retiré de l'en-tête** — c'était un fetch navigateur du calendrier complet sur _chaque_ page, pour afficher « R13/23 ». Résolu côté serveur dans le `Shell` (`features/season/getSeasonProgress.ts`), mutualisé avec les pages et mis en cache. Le hook est supprimé.
- [x] **Compte à rebours suspendu hors écran** — l'intervalle d'une seconde s'arrête sur `visibilitychange` et se resynchronise au retour. Couvert par un test e2e qui pilote `document.hidden` (Chromium headless ne le bascule pas tout seul, vérifié).
- [x] **JS client réduit — React Query entièrement retiré** — `/standings` et `/drivers` sont passés en Server Components, données en props ; il ne restait plus aucun consommateur, donc le `QueryProvider` du layout racine et la dépendance ont disparu.
      JS servi par route, mesuré en production : `/` 647 → **623 Ko**, `/standings` 739 → **699 Ko**, `/calendar` 730 → **704 Ko**, `/weekend` 643 → **619 Ko**. (Somme de tous les `.js` référencés par la page, préchargements de routes compris.)
      Effet de bord bienvenu : la saison de `/standings` et `/drivers` est désormais dans l'URL — l'item UX « saison dans l'URL » est réglé pour ces deux pages.
      ⚠️ `app/drivers/(list)/` est un groupe de routes, pas un dossier décoratif : il empêche le `loading.tsx` de couvrir `/drivers/[driverId]`, qui appelle `notFound()`. Sans lui, cette route repassait à 200 — attrapé par le smoke e2e.
- [x] **Polices — faux problème** — mesuré avant/après : **5 fichiers préchargés, 101 Ko, identique**. next/font ne préchargeait déjà que le nécessaire, les 12 instances statiques n'étaient pas toutes servies. Archivo passe quand même en police variable (config plus simple) et IBM Plex Mono gagne la graisse 700, utilisée 13 fois sans être chargée — le navigateur synthétisait un faux gras.
- [ ] **`/results` toujours entièrement client** — la pagination à défilement infini (IntersectionObserver, état de page) est une vraie interaction ; la convertir serait une réécriture pour un gain limité. Laissé tel quel volontairement. **M**

---

## 🎯 Suggestion d'ordre d'attaque

1. Le lot **S** de bugfix (parsing des temps, prochaine course, hydratation) — petits, à fort impact sur la justesse affichée.
2. **Loading / error states** — c'est ce qui se voit le plus vu la lenteur de l'API.
3. **Cache manquant + `useSeasonProgress`** — gain de perf immédiat pour un effort minime.
4. Puis les features, sur une base saine.
