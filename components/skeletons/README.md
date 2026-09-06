# Squelettes de chargement

## Règle importante : `loading.tsx` et `notFound()` ne cohabitent pas

Un `loading.tsx` — **y compris à la racine de `app/`** — met la route en
streaming. Le statut HTTP part alors avec le premier octet, donc avant que la
page ait pu appeler `notFound()` : la page 404 s'affiche correctement, mais
avec un statut **200**. Invisible à l'œil, faux pour les crawlers.

Mesuré sur `/results/2024/999` (build de production) :

| `loading.tsx` présent | statut     |
| --------------------- | ---------- |
| racine + route        | 200 ❌     |
| route seule           | 200 ❌     |
| racine seule          | 200 ❌     |
| aucun                 | **404 ✅** |

`notFound()` depuis `generateMetadata` ne rattrape pas le problème.

**Conséquence :** pas de `loading.tsx` à la racine, ni sur une route qui appelle
`notFound()` (aujourd'hui `/results/[season]/[round]` et `/drivers/[driverId]`).
Ces routes gardent la barre de progression `nextjs-toploader` pendant la
navigation.

Les pages qui chargent leurs données **depuis le navigateur** ne sont pas
concernées : leur squelette est rendu dans le composant, sans effet sur le
statut HTTP. C'est le cas de `/calendar`, `/standings`, `/drivers` et
`/results`.
