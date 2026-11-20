# Sources des données CleanLap

- [Jolpica-F1](https://github.com/jolpica/jolpica-f1) fournit les calendriers, les résultats, les classements et les référentiels. Les données sont mises à disposition sous licence [CC BY-NC-SA 4.0](https://github.com/jolpica/jolpica-f1/blob/main/TERMS.md).
- [OpenF1](https://openf1.org/) fournit les classements et meilleurs chronos des essais libres. L'accès gratuit couvre les sessions depuis 2023 en dehors de la fenêtre du direct. CleanLap associe le classement aux pilotes via leur numéro de voiture dans la séance.
- [F1DB](https://github.com/f1db/f1db) et ses contributeurs fournissent les données embarquées sous licence [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). CleanLap filtre les tables de la [version v2026.20.0](https://github.com/f1db/f1db/releases/tag/v2026.20.0), agrège les résumés et les records par tracé, puis réindexe les données avec les identifiants Jolpica. Les chiffres du palmarès sont arrêtés à la version importée.

## Actualiser l’export F1DB

Télécharger l'archive `f1db-json-splitted.zip` depuis la [version F1DB](https://github.com/f1db/f1db/releases) choisie. Avec Python 3, importer l'archive depuis la racine du dépôt.

```bash
python3 scripts/import-f1db.py /chemin/vers/f1db-json-splitted.zip v2026.20.0
```

Utiliser le tag de l'archive comme argument de version. Le script lit les catalogues publics Jolpica pour associer les identifiants et régénère les deux fichiers JSON dans `lib/api/data`. Vérifier leur diff et lancer `npm test` avant d'intégrer l'actualisation.
