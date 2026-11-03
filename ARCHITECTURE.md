# Architecture du gabarit SCORM 1.2

Le projet est écrit progressivement sur disque. Il repose sur deux livres d'ADL : **Content Aggregation Model (CAM), version 1.2** pour le colis et son manifeste, et **Run-Time Environment (RTE), version 1.2** pour les huit fonctions de communication et le modèle de données.

Un seul SCO (Sharable Content Object, une capsule suivie individuellement) contient plusieurs écrans HTML. La navigation interne ne recharge pas la page : une seule session reste ouverte jusqu'à la sortie explicite.

- `imsmanifest.xml` : bordereau du colis, point d'entrée et inventaire des fichiers.
- `scorm_api_wrapper.js` : découverte de `API`, huit méthodes natives, utilitaires, simulation locale.
- `index.html`, `styles.css`, `demo.js` : démonstration accessible et blocs réutilisables.
- `README.md` : parcours de prise en main et limites de portabilité.
- `docs/` : référence complète du modèle de données et provenance normative.
- `tests/` : vérifications reproductibles du moteur.
- `tools/` : validation et création d'une archive sans dossier parent.

La simulation est un outil pédagogique, pas une certification ADL. Elle ne remplace jamais une API LMS trouvée qui refuse l'initialisation. Sur une adresse web distante, l'absence d'API doit être signalée, sans fausse sauvegarde locale. Un double-clic local ou un serveur localhost peut activer la simulation automatiquement.

SCORM décrit les échanges et le paquetage ; les activités pédagogiques restent des créations HTML/CSS/JavaScript. Les éléments optionnels et les rapports du LMS ne permettent pas de promettre une prise en charge identique sur toutes les plateformes. Les références et les limites vérifiées sont détaillées dans `docs/SOURCES.md`.
