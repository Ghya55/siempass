# Format des specs

*Une spec est un fichier markdown, seule source, lisible par une IA sans naviguer et par l'associé sans effort. Elle remplace le ticket : elle dit quoi faire et quand c'est fini.*

## Principes
- **Un fichier par sujet** : `specs/<slug>.md`. Pas d'index à tenir : le dossier est l'index.
- **Le corps parle métier.** Pas de nœud Figma, de composant ni de chemin de code hors « Détails techniques ». Textes d'interface exacts entre « ».
- **Sections fixes**, dans l'ordre ; une section vide porte « *Sans objet.* ».
- **Rien ne se perd** : une règle retirée garde son identifiant, barrée, avec la raison. L'historique, c'est git.
- **150 lignes au plus.** Au-delà, on découpe.

## En-tête
```yaml
---
type: ecran | flux | objet | regle
titre: ""
statut: brouillon | à valider | validée | abandonnée
porteur: Quentin
figma: []          # liens de nœuds (ecran, flux)
maj: AAAA-MM-JJ
---
```

## Sections
| `ecran` / `flux` | `objet` | `regle` |
|---|---|---|
| Intention (ce que la personne vient faire, une phrase) | Définition | Énoncé |
| Blocs (présence, ordre, états) | Attributs (nom, type, obligatoire, exemple) | Cas (situation → résultat) |
| Règles | Règles | Cas limites |
| Cas limites | Cas limites | Ouvert pour Ghya |
| **Fini quand** (critères vérifiables, des relations, pas des mesures) | Ouvert pour Ghya | Détails techniques |
| Ouvert pour Ghya | Détails techniques | |
| Détails techniques | | |

## Identifiants
Chaque règle, cas limite et critère commence par un identifiant unique : `**<PRÉFIXE>-<n> — <titre>.** Texte.` Un préfixe par fichier, déclaré en tête (`PART-` pour partenaires). On cite par lien relatif : `[PART-3](partenaires.md#part-3)`.

## « Ouvert pour Ghya »
Une question par ligne, numérotée (`1.`). Tant que la section n'est pas « *Sans objet.* », `tache.sh etat` la remonte. Une question tranchée est retirée et sa réponse rejoint la règle concernée.

## Contrôles
`bash .claude/tools/specs-check.sh`, lancé par `tache.sh livrer` : en-tête, sections, identifiants uniques, liens, pas de nœud Figma dans le corps, 150 lignes.
