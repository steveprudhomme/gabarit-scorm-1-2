# Architecture du gabarit SCORM 1.2

Le projet repose sur deux livres d'ADL : **Content Aggregation Model (CAM), version 1.2** pour le colis et son manifeste, et **Run-Time Environment (RTE), version 1.2** pour les huit fonctions de communication et le modèle de données.

Un seul SCO (Sharable Content Object, une capsule suivie individuellement) contient plusieurs écrans HTML. La navigation interne ne recharge pas la page : une seule session reste ouverte jusqu'à la sortie explicite.

## Séparer la capsule et le dépôt de travail

| Emplacement | Rôle |
|---|---|
| `src/imsmanifest.xml` | Bordereau du colis, point d'entrée et inventaire des fichiers. |
| `src/scorm_api_wrapper.js` | Découverte de `API`, huit méthodes natives, utilitaires et simulation locale. |
| `src/index.html`, `src/styles.css`, `src/demo.js` | Démonstration accessible et blocs réutilisables. |
| `src/*.xsd` | Schémas nécessaires à la validation du paquetage. |
| `doc/` | Guide débutant, référence complète du modèle, sources et validation. |
| `examples/` | Variantes à adapter et à copier dans `src/` selon le guide. |
| `tests/` | Vérifications reproductibles du moteur, du ZIP et banc d'essai LMS. |
| `tools/` | Validation et création d'une archive sans dossier parent. |
| `references/` | Documents normatifs et originaux conservés pour leur provenance. |
| `dist/` | ZIP SCORM généré, prêt à importer dans un LMS. |
| `README.md` | Présentation et commandes à lancer depuis la racine du dépôt. |

`tools/package.py` lit le manifeste dans `src/`, vérifie que les fichiers référencés restent dans ce dossier et ajoute les schémas de validation. Il écrit ensuite `dist/gabarit-scorm12.zip`, avec des chemins relatifs à `src/`. Le manifeste se retrouve donc à la racine du ZIP, sans dossier parent `src/`. La documentation, les exemples, les tests et les outils ne sont pas distribués aux apprenants.

Cette séparation ne change ni l'API SCORM ni la structure interne de la capsule : les fichiers exécutables et les schémas restent au même niveau dans `src/` et dans le ZIP. Aucun outil de compilation n'est nécessaire pour essayer `src/index.html` directement.

La simulation est un outil pédagogique, pas une certification ADL. Elle ne remplace jamais une API LMS trouvée qui refuse l'initialisation. Sur une adresse web distante, l'absence d'API doit être signalée, sans fausse sauvegarde locale. Un double-clic local ou un serveur localhost peut activer la simulation automatiquement.

SCORM décrit les échanges et le paquetage ; les activités pédagogiques restent des créations HTML/CSS/JavaScript. Les éléments optionnels et les rapports du LMS ne permettent pas de promettre une prise en charge identique sur toutes les plateformes. Les références et les limites vérifiées sont détaillées dans [SOURCES.md](SOURCES.md).
